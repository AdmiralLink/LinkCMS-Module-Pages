<?php

namespace LinkCMS\Modules\Pages;

use \Flight;

use LinkCMS\Actor\Display;
use LinkCMS\Actor\User;
use LinkCMS\Model\User as UserModel;

class Route {
    public static function do_routes() {
        Flight::route('GET /manage/pages', function() {
            User::is_authorized(UserModel::USER_LEVEL_AUTHOR);
            Display::load_page('/pages/manage/index.twig', []);
        });
        
        Flight::route('GET /manage/pages/create', function() {
            User::is_authorized(UserModel::USER_LEVEL_AUTHOR);
            Display::load_page('pages/manage/create.twig', []);
        });
    }
}