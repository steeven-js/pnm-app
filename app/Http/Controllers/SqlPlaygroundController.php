<?php

namespace App\Http\Controllers;

use App\Services\SqlPlaygroundService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SqlPlaygroundController extends Controller
{
    private const VALID_LEVELS = ['debutant', 'intermediaire', 'investigation'];

    public function index(SqlPlaygroundService $service): Response
    {
        return Inertia::render('SqlPlayground', [
            'schema' => $service->getSchema(),
        ]);
    }

    public function scenarios(string $level, SqlPlaygroundService $service): Response
    {
        abort_unless(in_array($level, self::VALID_LEVELS), 404);

        return Inertia::render('SqlScenarios', [
            'schema' => $service->getSchema(),
            'level' => $level,
        ]);
    }

    public function execute(Request $request, SqlPlaygroundService $service): JsonResponse
    {
        $request->validate([
            'sql' => ['required', 'string', 'max:5000'],
        ]);

        try {
            $result = $service->execute($request->input('sql'));

            return response()->json([
                'success' => true,
                ...$result,
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 422);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'error' => 'Erreur SQL : '.$e->getMessage(),
            ], 422);
        }
    }
}
