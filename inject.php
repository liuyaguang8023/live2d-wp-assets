<?php
add_action('wp_footer', function () {
    echo "\n" . '<script src="/wp-content/uploads/live2d/autoload.js?v=20"></script>' . "\n";
}, 100);
