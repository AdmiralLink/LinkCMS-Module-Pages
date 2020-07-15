<?php

namespace LinkCMS\Modules\Pages;

use LinkCMS\Actor\Core;
use LinkCMS\Actor\Display;
use LinkCMS\Actor\Route as Router;

class Actor {
    public static function register() {
        Display::add_template_directory(__DIR__. '/templates');
        Router::register_namespace('pages', 'manage');
        Router::add_route(['LinkCMS\Modules\Pages\Route','do_routes']);
        Route::add_assets_directory();
        self::add_menu_items();
    }

    public static function add_menu_items() {
        Core::add_menu_item('pages', 'Pages', '/manage/pages', false, 5);
    }
}