<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f5f6fa;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            text-align: center;
        }

        .container {
            background-color: #fff;
            padding: 40px 30px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            max-width: 400px;
        }

        h1 {
            font-size: 28px;
            margin-bottom: 20px;
        }

        p {
            font-size: 16px;
            color: #333;
            margin-bottom: 30px;
        }

        .success {
            color: #4CAF50;
        }

        .error {
            color: #e74c3c;
        }

        a.button {
            display: inline-block;
            padding: 12px 25px;
            background-color: #4CAF50;
            color: #fff;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            transition: background 0.3s ease;
        }

        a.button:hover {
            background-color: #45a049;
        }
    </style>
</head>

<body>
    <div class="container">
        @if(isset($status) && $status === 'success')
            <h1 class="success">Password Reset Successful</h1>
            <p>Your password has been updated. You can now login through the mobile app.</p>
        @else
            <h1 class="error">Invalid or Expired Link</h1>
            <p>The reset link is invalid or has expired. Please request a new password reset.</p>
        @endif
    </div>
</body>

</html>
