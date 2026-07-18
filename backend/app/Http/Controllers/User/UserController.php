<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    public function referees(): JsonResponse
    {
        $refereeRole = Role::where('name', 'referee')->firstOrFail();

        $users = User::where('role_id', $refereeRole->id)
            ->where('active', true)
            ->select('id', 'first_name', 'last_name')
            ->orderBy('last_name')
            ->get();

        return response()->json(['data' => $users]);
    }

    public function captains(): JsonResponse
    {
        $captainRole = Role::where('name', 'captain')->firstOrFail();

        $users = User::where('role_id', $captainRole->id)
            ->where('active', true)
            ->select('id', 'first_name', 'last_name')
            ->orderBy('last_name')
            ->get();

        return response()->json(['data' => $users]);
    }
}
