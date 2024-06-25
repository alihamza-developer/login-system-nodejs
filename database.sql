CREATE TABLE `meta_data` (
    `id` int(11) NOT NULL AUTO_INCREMENT, `meta_key` varchar(250) NOT NULL, `meta_value` varchar(250) NOT NULL, `meta_json` text NOT NULL, `time` timestamp NOT NULL DEFAULT current_timestamp(), PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE `users` (
    `id` int(11) NOT NULL AUTO_INCREMENT, `fname` varchar(250) NOT NULL, `lname` varchar(250) NOT NULL, `name` varchar(250) NOT NULL, `email` varchar(250) NOT NULL, `image` varchar(250) NOT NULL, `password` varchar(250) NOT NULL, `is_admin` tinyint(1) NOT NULL DEFAULT 0, `verify_status` int(1) NOT NULL DEFAULT 0, `verify_token` varchar(250) NOT NULL, `password_forgot_token` varchar(250) NOT NULL, `token_expiry_date` timestamp NULL DEFAULT NULL, `date_added` timestamp NOT NULL DEFAULT current_timestamp(), `uid` varchar(250) NOT NULL, PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;