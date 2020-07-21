<?php

namespace LinkCMS\Modules\Pages;

use LinkCMS\Controller\Content as ContentController;
use LinkCMS\Modules\Pages\Model\Page;

class Controller extends ContentController {
    public static function load_all($offset=false, $limit=false, $orderBy='id DESC') {
        $results = parent::load_all($offset, $limit, $orderBy);
        if ($results) {
            $pages = [];
            foreach ($results as $content) {
                $page = new Page($content);
                array_push($pages, $page);
            }
            return $pages;
        }
        return $results;
    }
}