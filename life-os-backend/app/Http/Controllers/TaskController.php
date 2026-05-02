<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Http\Resources\TaskResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class TaskController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        try {
            $tasks = $request->user()->tasks()->latest()->get();
            return TaskResource::collection($tasks);
        } catch (\Exception $e) {
            Log::error('Failed to fetch tasks: ' . $e->getMessage());
            return response()->json(['message' => 'Internal Server Error'], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'deadline_date' => 'nullable|date',
                'priority' => 'nullable|in:Low,Medium,High',
                'status' => 'nullable|in:Pending,In-Progress,Done',
                'scheduled_day' => 'nullable|string',
            ]);

            $task = $request->user()->tasks()->create($validated);
            return new TaskResource($task);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Failed to create task: ' . $e->getMessage());
            return response()->json(['message' => 'Internal Server Error'], 500);
        }
    }

    public function show(Request $request, Task $task)
    {
        try {
            $this->authorize('view', $task);
            return new TaskResource($task);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return response()->json(['message' => 'Forbidden'], 403);
        } catch (\Exception $e) {
            Log::error('Failed to show task: ' . $e->getMessage());
            return response()->json(['message' => 'Internal Server Error'], 500);
        }
    }

    public function update(Request $request, Task $task)
    {
        try {
            $this->authorize('update', $task);

            if ($task->status === 'Done' && !$request->boolean('reopen')) {
                return response()->json([
                    'message' => 'Task is marked as Done and is locked.',
                    'errors' => ['status' => ['You must reopen the task to make changes.']]
                ], 422);
            }

            $validated = $request->validate([
                'title' => 'sometimes|required|string|max:255',
                'description' => 'nullable|string',
                'deadline_date' => 'nullable|date',
                'priority' => 'nullable|in:Low,Medium,High',
                'status' => 'nullable|in:Pending,In-Progress,Done',
                'scheduled_day' => 'nullable|string',
            ]);

            $task->update($validated);
            return new TaskResource($task);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return response()->json(['message' => 'Forbidden'], 403);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Failed to update task: ' . $e->getMessage());
            return response()->json(['message' => 'Internal Server Error'], 500);
        }
    }

    public function destroy(Request $request, Task $task)
    {
        try {
            $this->authorize('delete', $task);
            $task->delete();
            return response()->json(['message' => 'Task deleted']);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return response()->json(['message' => 'Forbidden'], 403);
        } catch (\Exception $e) {
            Log::error('Failed to delete task: ' . $e->getMessage());
            return response()->json(['message' => 'Internal Server Error'], 500);
        }
    }
}
