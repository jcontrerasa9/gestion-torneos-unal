<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user || ! $user->role) { // el usuario viene vacio, o no tiene rol asignado
            abort(403, 'You don\'t have a role assigned.');
        }

        if (! in_array($user->role->name, $roles)) { // valida si el rol esta en la lista de la ruta
            abort(403, 'Your role "' . $user->role->name . '" is not authorized for this action. Required: ' . implode(', ', $roles));
        }

        return $next($request);
    }
}
