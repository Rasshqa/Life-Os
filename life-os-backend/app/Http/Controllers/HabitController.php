<?php

namespace App\Http\Controllers;

use App\Models\Habit;
use App\Http\Resources\HabitResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class HabitController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        try {
            $habits = $request->user()->habits()->latest()->get();
            return HabitResource::collection($habits);
        } catch (\Exception $e) {
            Log::error('Failed to fetch habits: ' . $e->getMessage());
            return response()->json(['message' => 'Internal Server Error'], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'streak_count' => 'nullable|integer',
                'last_completed_date' => 'nullable|date|before_or_equal:today',
            ]);

            $habit = $request->user()->habits()->create($validated);
            return new HabitResource($habit);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Failed to create habit: ' . $e->getMessage());
            return response()->json(['message' => 'Internal Server Error'], 500);
        }
    }

    public function show(Request $request, Habit $habit)
    {
        try {
            $this->authorize('view', $habit);
            return new HabitResource($habit);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return response()->json(['message' => 'Forbidden'], 403);
        } catch (\Exception $e) {
            Log::error('Failed to show habit: ' . $e->getMessage());
            return response()->json(['message' => 'Internal Server Error'], 500);
        }
    }

    public function update(Request $request, Habit $habit)
    {
        try {
            $this->authorize('update', $habit);

            $validated = $request->validate([
                'name' => 'sometimes|required|string|max:255',
                'streak_count' => 'nullable|integer',
                'last_completed_date' => 'nullable|date|before_or_equal:today',
            ]);

            $habit->update($validated);
            return new HabitResource($habit);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return response()->json(['message' => 'Forbidden'], 403);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Failed to update habit: ' . $e->getMessage());
            return response()->json(['message' => 'Internal Server Error'], 500);
        }
    }

    public function destroy(Request $request, Habit $habit)
    {
        try {
            $this->authorize('delete', $habit);
            $habit->delete();
            return response()->json(['message' => 'Habit deleted']);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return response()->json(['message' => 'Forbidden'], 403);
        } catch (\Exception $e) {
            Log::error('Failed to delete habit: ' . $e->getMessage());
            return response()->json(['message' => 'Internal Server Error'], 500);
        }
    }
}
