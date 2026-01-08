<?php

namespace App\Http\Controllers;

use App\Models\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RouteController extends Controller
{
    public function index()
    {
        return Route::where('user_id', Auth::id())->latest()->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'from_name' => 'required|string',
            'to_name' => 'required|string',
            'from_lat' => 'required|numeric',
            'from_lng' => 'required|numeric',
            'to_lat' => 'required|numeric',
            'to_lng' => 'required|numeric',
        ]);

        return Auth::user()->routes()->create($validated);
    }

    public function update(Request $request, Route $route)
    {
        if ($route->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $route->update($request->all());
        return $route;
    }

    public function destroy(Route $route)
    {
        if ($route->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        $route->delete();
        return response()->json(['success' => true]);
    }

    // Mandatory for Requirement 7: Bulk Delete
    public function bulkDestroy(Request $request)
    {
        $request->validate(['ids' => 'required|array']);

        Route::whereIn('id', $request->ids)
             ->where('user_id', Auth::id())
             ->delete();

        return response()->json(['success' => true]);
    }
}
