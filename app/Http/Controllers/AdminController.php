<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AdminController extends Controller
{
    // Admin Dashboard
    public function dashboard()
    {
        return view('app');
    }

    // Accomplishments Page
    public function accomplishments()
    {
        return view('app');
    }

    // Reports Page
    public function reports()
    {
        return view('app');
    }

}
