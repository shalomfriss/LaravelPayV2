### Start MySQL, the server, mail server

Quickrun
-------------------------------------------------------
php artisan serve --port=8000 --host="0.0.0.0"
docker run -d -p 8025:8025 -p 1025:1025 mailhog/mailhog
// sudo /usr/local/mysql/support-files/mysql.server start

Roles are defined in JetstreamServiceProvider

# Still working out Moodle here are the options 
# ---------------------------------------------------
# Run Latest Moodle

Run docker compose up

<!-- docker run --rm -p 8100:443 moodlehq/moodleapp


docker run --rm --name moodle \
  -p 3000:8080 -p 8443:8443 \
  -e MOODLE_DATABASE_TYPE=mysqli \
  -e MOODLE_DATABASE_HOST=host.docker.internal \
  -e MOODLE_DATABASE_PORT_NUMBER=3306 \
  -e MOODLE_DATABASE_USER=root \
  -e MOODLE_DATABASE_PASSWORD=gr8minds \
  -e MOODLE_DATABASE_NAME=moodle \
  -v moodle_app:/bitnami/moodle \
  -v moodle_data:/bitnami/moodledata \ nb=
  moodlehq/moodleapp

# Run Moodle through Docker
docker pull bitnamilegacy/moodle:latest
docker rm moodle

docker run -d --name moodle \
  -p 3000:8080 -p 8443:8443 \
  -e MOODLE_DATABASE_TYPE=mysqli \
  -e MOODLE_DATABASE_HOST=host.docker.internal \
  -e MOODLE_DATABASE_PORT_NUMBER=3306 \
  -e MOODLE_DATABASE_USER=root \
  -e MOODLE_DATABASE_PASSWORD=gr8minds \
  -e MOODLE_DATABASE_NAME=moodle \
  -v moodle_app:/bitnami/moodle \
  -v moodle_data:/bitnami/moodledata \
  bitnamilegacy/moodle:latest

user: user
pass: bitnami

docker start moodle
docker stop moodle

Check 'Enable web services' then click 'Save Changes'

Located at port 3000 -->

**********************************************************
** Troubleshooting **
**********************************************************
Can't connect to MySQL 
----------------------
you mind need to add 
#bind-address = 127.0.0.1
bind-address = 0.0.0.0


```
~/scripts/start_mysql 
php artisan serve

# This will allow your site to be accessible via your ip
php artisan serve --port=8081 --host="0.0.0.0"

docker run -d -p 8025:8025 -p 1025:1025 mailhog/mailhog
php artisan migrate:fresh --seed --seeder=DatabaseSeeder
php artisan voyager:install
php artisan voyager:admin admin@admin.com --create

Site: localhost:8000
Mail: localhost:8025
Moodle: localhost:8080
```

---
## Recreate database with all migrations and seeders
```
php artisan migrate:fresh --seed --seeder=DatabaseSeeder
```

## dump database table 
```
mysqldump -u root -p laraveljetstream > laraveljetstream.sql
```

## Run tests continually from the command line
Install this: https://github.com/doowb/watch-cli
and run this:
```
watch -p "**/*.php" -c "clear; php vendor/bin/codecept run; php artisan test"
```

Run : php artisan serve
Unit test: php artisan test 
UI tests: php vendor/bin/codecept run


## Troubleshooting
No session table?
```
php artisan session:table
php artisan migrate
```

Add database details to .env
Add Paypal details to .env
Add Stripe details to .env

# Roles

Roles
---
Roles can be added in JetstreamServiceProvider. 


## Moodle
Install Moodle and run it with Apache
Example endpoint: http://localhost:8080/ or 3000
Default user: admin
Default pass: gr8minds@Work

To activate web services
Site Administration -> Server -> Web services -> External services

Functions needed
-------------------
core_course_get_courses	
core_course_get_courses_by_field
core_user_get_users
core_course_get_categories
core_course_get_contents
core_course_get_course_module

Also generate a token for use 
Make sure MOODLE_TOKEN is exported in your env

## Fake email for testing
To setup fake email for testing

```
docker run -d -p 8025:8025 -p 1025:1025 mailhog/mailhog

// Update your application’s mail settings (e.g., in .env) to:
MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
```

Interface should be at
http://localhost:8025/

*NOTE: Do not accept team invitations before creating an account!

## Voyager

If you are logged in as a Voyager admin you can go to https://yoursite/admin, otherwise you will be redirected to the dashboard.  
If you are logged out you can see https://yoursite/admin.

Create admin user
---------------------------------
If you already have a user you want to make administrator
```
php artisan voyager:admin admin@admin.com
```

If you want to add a new user with the administrator role
```
php artisan voyager:admin your@email.com --create
```

// Components / CSS
## Flowbite
https://flowbite.com/docs/getting-started/introduction/



# Make a user an admin (only admins can create teams)
php artisan tinker
$role = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'admin']);
$user = \App\Models\User::where('email', 'admin@admin.com')->first();
$user->assignRole($role);



#######################################################################################
#######################################################################################
## AI Generated description
#######################################################################################
#######################################################################################
Project Overview
This is a Laravel 10.x application that integrates payment processing functionality with Laravel Jetstream for authentication and user management. It's a web application that handles user subscriptions and payments.

### Key Technologies
PHP 8.1+
Laravel 10.x - PHP framework
Laravel Jetstream - Authentication scaffolding
Livewire - For dynamic frontend components
Voyager - Admin panel
Sanctum - API authentication
Tailwind CSS - Styling

### Main Features
User Authentication & Management
Built with Laravel Jetstream
Email verification
Profile management
Payment Processing
Subscription management
Payment approval flow
Cancellation handling
Admin Panel
Powered by Voyager
Content and user management
Testing
PHPUnit for unit tests
Codeception for acceptance testing

### Project Structure
/app - Core application code
/config - Configuration files
/database - Migrations, seeders, and factories
/resources - Views and frontend assets
/routes - Application routes
/tests - Test files
/public - Publicly accessible files

### Dependencies
Backend: Guzzle, Laravel Tinker
Development: Debugbar, Faker, Mockery, PHPUnit

### Notable Routes
/ - Welcome page
/dashboard - User dashboard
/subscribe - Subscription management
/payments/* - Payment processing
/admin - Voyager admin panel






















<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework.

You may also try the [Laravel Bootcamp](https://bootcamp.laravel.com), where you will be guided through building a modern Laravel application from scratch.

If you don't feel like reading, [Laracasts](https://laracasts.com) can help. Laracasts contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

## Laravel Sponsors

We would like to extend our thanks to the following sponsors for funding Laravel development. If you are interested in becoming a sponsor, please visit the [Laravel Partners program](https://partners.laravel.com).

### Premium Partners

- **[Vehikl](https://vehikl.com/)**
- **[Tighten Co.](https://tighten.co)**
- **[WebReinvent](https://webreinvent.com/)**
- **[Kirschbaum Development Group](https://kirschbaumdevelopment.com)**
- **[64 Robots](https://64robots.com)**
- **[Curotec](https://www.curotec.com/services/technologies/laravel/)**
- **[Cyber-Duck](https://cyber-duck.co.uk)**
- **[DevSquad](https://devsquad.com/hire-laravel-developers)**
- **[Jump24](https://jump24.co.uk)**
- **[Redberry](https://redberry.international/laravel/)**
- **[Active Logic](https://activelogic.com)**
- **[byte5](https://byte5.de)**
- **[OP.GG](https://op.gg)**

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

