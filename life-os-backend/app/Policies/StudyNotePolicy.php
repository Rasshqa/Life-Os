<?php

namespace App\Policies;

use App\Models\StudyNote;
use App\Models\User;

class StudyNotePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, StudyNote $studyNote): bool
    {
        return $user->id === $studyNote->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, StudyNote $studyNote): bool
    {
        return $user->id === $studyNote->user_id;
    }

    public function delete(User $user, StudyNote $studyNote): bool
    {
        return $user->id === $studyNote->user_id;
    }
}
