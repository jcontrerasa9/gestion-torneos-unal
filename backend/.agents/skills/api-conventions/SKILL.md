---
name: api-conventions
description: "Apply this skill when creating or modifying API endpoints, controllers, FormRequests, middleware, or route definitions in this project. Covers response format, error handling, authorization patterns, and validation conventions specific to this application."
metadata:
  author: team
---

# API Conventions

Project-specific conventions for building consistent, descriptive REST APIs.

## Response Format

Every successful response must wrap data with `message` and `data`:

```php
return response()->json([
    'message' => 'Team created successfully',
    'data' => $team->load('captain'),
], 201);
```

For collections (index), the `data` field contains the paginated result:

```php
return response()->json([
    'message' => 'Teams retrieved successfully',
    'data' => Team::latest()->paginate(15),
]);
```

For deletes with no return data, only `message`:

```php
return response()->json(['message' => 'Team deleted successfully'], 200);
```

## Error Responses

### Authorization (403)

```json
{ "message": "You can only update your own team." }
```

### Business rule violation (422)

```json
{ "message": "Team is enrolled in an active tournament." }
```

### Validation failure (422)

```json
{
    "message": "The given data was invalid.",
    "errors": {
        "name": ["A team with that name already exists."],
        "captain_id": ["The specified user does not exist."]
    }
}
```

## Authorization Pattern

Use a two-layer approach:

1. **Middleware** (`role:captain,admin`) — checks if the user's role is allowed for the route.
2. **FormRequest `authorize()`** — checks if the user is authorized for the specific resource (e.g., is the captain of this team).

```php
// In the FormRequest
public function authorize(): bool
{
    $team = $this->route('team');

    if ($this->user()->id !== $team->captain_id && $this->user()->role->name !== 'admin') {
        throw new AuthorizationException('You can only update your own team.');
    }

    return true;
}
```

Do not duplicate role checks in `authorize()` if middleware already handles them.

## Validation

- Always use FormRequest classes, never inline `$request->validate()` in controllers.
- Add a `messages()` method with custom, descriptive error messages for each rule.
- Use `Rule::when()` for conditional validation based on user role or other context.
- Use `Rule::unique()->ignore()` for update validation to exclude the current record.

```php
public function messages(): array
{
    return [
        'name.required' => 'The team name is required.',
        'name.unique' => 'A team with that name already exists.',
        'captain_id.exists' => 'The specified user does not exist.',
    ];
}
```

## Routes

- Use `apiResource` for read-only endpoints (`index`, `show`).
- Use manual routes with `role` middleware for write endpoints (`store`, `update`, `destroy`).
- Always group protected routes under `auth:sanctum`.

```php
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('teams', TeamController::class)->only(['index', 'show']);

    Route::middleware('role:captain,admin')->group(function () {
        Route::post('/teams', [TeamController::class, 'store'])->name('teams.store');
        Route::put('/teams/{team}', [TeamController::class, 'update'])->name('teams.update');
        Route::delete('/teams/{team}', [TeamController::class, 'destroy'])->name('teams.destroy');
    });
});
```

## Controllers

- Keep controllers thin. Business logic goes in FormRequests or Action classes.
- All methods must have explicit `JsonResponse` return types.
- Use `$request->validated()` to get only validated data, never `$request->all()`.
- Eager-load relationships before returning models: `$team->load('captain')`.
- Use `->fresh('relation')` after update to get the refreshed model with relations.

## SoftDeletes

Use SoftDeletes on entities with foreign key relationships to preserve referential integrity. This prevents cascade deletes when related records exist (e.g., tournament enrollments).

```php
class Team extends Model
{
    use HasFactory, SoftDeletes;
}
```

The migration must include `$table->softDeletes();` after `$table->timestamps();`.

## Factories & Seeders

- Use **factories** for test data (temporary, isolated in test DB).
- Use **seeders with factories** for development data (persistent in dev DB).
- Seeders with static data (roles, configs) use `firstOrCreate` for idempotency.
- Add role-based states to `UserFactory`: `asAdmin()`, `asCaptain()`, `asPlayer()`, etc.
