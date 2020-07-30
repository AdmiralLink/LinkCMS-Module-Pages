<?php

namespace LinkCMS\Modules\Pages;

use \Flight;


use LinkCMS\Actor\Config;
use LinkCMS\Actor\Display;
use LinkCMS\Actor\Notify;
use LinkCMS\Actor\User;
use LinkCMS\Actor\Route as Router;
use LinkCMS\Controller\Content as ContentController;
use LinkCMS\Modules\Pages\Controller as PageController;
use LinkCMS\Model\User as UserModel;
use LinkCMS\Modules\Pages\Model\Page as Page;

class Route {
    public static function add_assets_directory() {
        Router::register_folder_map(__DIR__ . '/public/js', 'pages/assets/js');
    }

    public static function do_routes() {
        Flight::route('GET /manage/pages', function() {
            User::is_authorized(UserModel::USER_LEVEL_AUTHOR);
            $pages = PageController::load_all();
            Display::load_page('/pages/manage/index.twig', ['pages'=>$pages]);
        });
        
        Flight::route('GET /manage/pages/create', function() { 
            User::is_authorized(UserModel::USER_LEVEL_AUTHOR);
            Display::load_page('pages/manage/edit.twig', ['page'=>false]);
        });

        Flight::route('POST /api/pages/save', function() {
            if (User::is_authorized(UserModel::USER_LEVEL_AUTHOR)) {
                // TODO: If updating, have to check that the current user is allowed to update that post    
                if (!empty($_POST)) {
                    $page = new Page($_POST);
                    if ($page->id) {
                        $results = ContentController::update($page);
                        if ($results) {
                            new Notify(['type' => 'update'], 'success');
                        } else {
                            new Notify('Database problem', 'error');
                        }
                    } else {
                        $results = ContentController::save($page);
                        if ($results) {
                            new Notify(['type'=>'insert', 'id'=> $results], 'success');
                        } else {
                            new Notify('Database problem', 'error');
                        }
                    }
                }
            }
        });

        Flight::route('GET /manage/pages/edit/@id', function($id) {
            if (User::is_authorized(UserModel::USER_LEVEL_AUTHOR)) {
                $page = new Page(ContentController::load_by('id', $id));
                if ($page) {
                    $page = json_encode($page);
                    Display::load_page('pages/manage/edit.twig', ['page'=>$page, 'id'=>$id]);
                } else {
                    Flight::error('No such page found');
                }
            }
        });

        Flight::route('GET /manage/pages/delete/@id', function($id) {
            if (User::is_authorized(UserModel::USER_LEVEL_ADMIN)) {
                $pageContent = ContentController::load_by('id', $id);
                if ($pageContent) {
                    $page = new Page($pageContent);
                    Display::load_page('pages/manage/delete.twig', ['page'=>$page]);   
                } else {
                    Flight::error('No such page');
                }
            }
        });

        Flight::route('POST /manage/pages/delete/@id', function($id) {
            if (User::is_authorized(UserModel::USER_LEVEL_ADMIN)) {
                $pageContent = ContentController::load_by('id', $id);
                if ($pageContent) {
                    ContentController::delete_by('id', $id);
                    $url = Config::get_config('siteUrl');
                    Flight::redirect($url . '/manage/pages');
                } else {
                    Flight::error('No such page');
                }
            }
        });
    }
}