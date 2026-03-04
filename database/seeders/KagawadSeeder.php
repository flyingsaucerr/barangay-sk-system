<?php
// database/seeders/KagawadSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Kagawad;
use App\Models\KagawadActivity;

class KagawadSeeder extends Seeder
{
    public function run()
    {
        $kagawad1 = Kagawad::create([
            'name' => 'Maria Santos',
            'position' => 'SK Chairman',
            'bio' => 'Dedicated to serving the youth of our barangay with passion and commitment. Leading various community programs and youth development initiatives.',
            'contact' => '+63 912 345 6789',
            'email' => 'maria.santos@skbarangay.gov.ph',
            'address' => 'Barangay San Jose, Quezon City',
            'date_started' => 'January 2023',
            'is_featured' => true
        ]);

        KagawadActivity::create([
            'kagawad_id' => $kagawad1->id,
            'title' => 'Community Youth Summit',
            'date' => '2024-01-15',
            'description' => 'Organized and led the annual youth leadership summit with 200+ attendees'
        ]);

        KagawadActivity::create([
            'kagawad_id' => $kagawad1->id,
            'title' => 'Basketball Tournament',
            'date' => '2024-01-10',
            'description' => 'Spearheaded the inter-barangay basketball competition'
        ]);

        $kagawad2 = Kagawad::create([
            'name' => 'Juan Dela Cruz',
            'position' => 'SK Kagawad',
            'bio' => 'Passionate about youth development and community sports programs.',
            'contact' => '+63 923 456 7890',
            'email' => 'juan.delacruz@skbarangay.gov.ph',
            'address' => 'Barangay San Jose, Quezon City',
            'date_started' => 'March 2023',
            'is_featured' => false
        ]);

        KagawadActivity::create([
            'kagawad_id' => $kagawad2->id,
            'title' => 'Sports Festival',
            'date' => '2024-01-12',
            'description' => 'Organized the annual barangay sports festival'
        ]);
    }
}