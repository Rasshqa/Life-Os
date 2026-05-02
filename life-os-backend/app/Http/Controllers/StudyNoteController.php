<?php

namespace App\Http\Controllers;

use App\Models\StudyNote;
use App\Http\Resources\StudyNoteResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class StudyNoteController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        try {
            $studyNotes = $request->user()->studyNotes()->latest()->get();
            return StudyNoteResource::collection($studyNotes);
        } catch (\Exception $e) {
            Log::error('Failed to fetch study notes: ' . $e->getMessage());
            return response()->json(['message' => 'Internal Server Error'], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'topic' => 'required|string|max:255',
                'content' => 'required|string',
                'tags' => 'nullable|string',
            ]);

            $studyNote = $request->user()->studyNotes()->create($validated);
            return new StudyNoteResource($studyNote);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Failed to create study note: ' . $e->getMessage());
            return response()->json(['message' => 'Internal Server Error'], 500);
        }
    }

    public function show(Request $request, StudyNote $note)
    {
        try {
            $this->authorize('view', $note);
            return new StudyNoteResource($note);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return response()->json(['message' => 'Forbidden'], 403);
        } catch (\Exception $e) {
            Log::error('Failed to show study note: ' . $e->getMessage());
            return response()->json(['message' => 'Internal Server Error'], 500);
        }
    }

    public function update(Request $request, StudyNote $note)
    {
        try {
            $this->authorize('update', $note);

            $validated = $request->validate([
                'topic' => 'sometimes|required|string|max:255',
                'content' => 'sometimes|required|string',
                'tags' => 'nullable|string',
            ]);

            $note->update($validated);
            return new StudyNoteResource($note);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return response()->json(['message' => 'Forbidden'], 403);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Failed to update study note: ' . $e->getMessage());
            return response()->json(['message' => 'Internal Server Error'], 500);
        }
    }

    public function destroy(Request $request, StudyNote $note)
    {
        try {
            $this->authorize('delete', $note);
            $note->delete();
            return response()->json(['message' => 'Note deleted']);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return response()->json(['message' => 'Forbidden'], 403);
        } catch (\Exception $e) {
            Log::error('Failed to delete study note: ' . $e->getMessage());
            return response()->json(['message' => 'Internal Server Error'], 500);
        }
    }
}
