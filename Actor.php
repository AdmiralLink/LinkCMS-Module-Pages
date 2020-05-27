<?php

namespace LinkCMS\Modules\Pages;

use LinkCMS\Actor\Core;
use LinkCMS\Actor\Display;
use LinkCMS\Actor\Route;

class Actor {
    public static function register() {
        Display::add_template_directory(__DIR__. '/templates');
        Route::add_route(['LinkCMS\Modules\Pages\Route','do_routes']);
        self::add_menu_items();
    }

    public static function add_menu_items() {
        Core::add_menu_item('pages', 'Pages', '/manage/pages', false, 5);
    }
}