<?php

namespace LinkCMS\Modules\Pages;

use LinkCMS\Actor\Core;
use LinkCMS\Actor\Display;
use LinkCMS\Actor\Route as Router;

class Actor {
    public static function register() {
        $core = Core::load();
        $core->content->add_content_type('page', 'LinkCMS\Modules\Pages\Model\Page');
        Display::add_template_directory(__DIR__. '/templates');
        Router::register_namespace('pages', 'manage');
        Router::add_route(['LinkCMS\Modules\Pages\Route','do_routes']);
        Route::add_assets_directory();
        Core::add_menu_item('pages', 'Pages', '/manage/pages', false, 5);
        self::add_page_templates();
    }

    public static function add_page_templates() {
        $core = Core::load();
        $pageTemplates = ['page' => 'Standard page'];
        if (isset($core->theme->info->templates->page)) {
            foreach ($core->theme->info->templates->page as $innerArray) {
                $pageTemplates[$innerArray[0]] = $innerArray[1];
            }
        }
        Display::register_global('pageTemplates', $pageTemplates);
    }
}