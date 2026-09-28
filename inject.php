<?php
/**
 * Live2D 看板娘自托管注入 (self-hosted)
 * 在每页底部加载 /wp-content/uploads/live2d/autoload.js
 */
if (!defined('ABSPATH')) { exit; }
add_action('wp_footer', function () {
    echo "\n" . '<script src="/wp-content/uploads/live2d/autoload.js"></script>' . "\n";
}, 100);
