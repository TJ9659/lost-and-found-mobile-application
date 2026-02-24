<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'UTARIFY')</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="min-h-screen flex flex-col">

    <header class="bg-blue-900 text-white p-4 shadow">
        <div class="max-w-4xl mx-auto">
            <h1 class="text-lg font-bold uppercase">UTARIFY</h1>
        </div>
    </header>

    <main class="flex-1">
        <div class="max-w-md mx-auto p-6">
            @yield('content')
        </div>
    </main>

    <footer class="bg-blue-800 text-pink-200 p-4 text-center">
        &copy; {{ date('Y') }} UTARIFY. All rights reserved.
    </footer>

</body>
</html>
