<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsUser
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Cek apakah user sudah login dan apakah rolenya user
        if (auth()->check() && auth()->user()->role === 'staff') {
            return $next($request);
        }

        // Jika bukan user (baik itu admin atau tamu), lempar ke home
        return redirect('/')->with('error', 'Anda tidak memiliki akses user.');
    }
}
