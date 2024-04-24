-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name_user` VARCHAR(500) NOT NULL,
    `cellphone_user` VARCHAR(20) NOT NULL,
    `email_user` VARCHAR(200) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accounts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_user` INTEGER NOT NULL,
    `email_account` VARCHAR(500) NOT NULL,
    `pass_account` VARCHAR(200) NOT NULL,
    `name_profile` VARCHAR(200) NOT NULL,
    `code_profile` INTEGER NOT NULL,
    `id_category` INTEGER NOT NULL,
    `expiration_date` VARCHAR(12) NOT NULL,

    INDEX `accounts_id_user_fkey`(`id_user`),
    INDEX `accounts_id_category_fkey`(`id_category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories_account` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `category_name` VARCHAR(500) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vendors` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_vendor` VARCHAR(10) NOT NULL,
    `email` VARCHAR(500) NOT NULL,
    `type_doc` INTEGER NOT NULL,
    `num_doc` VARCHAR(10) NOT NULL,
    `password` VARCHAR(700) NOT NULL,
    `access_token` VARCHAR(700) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vendor_recovery` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_vendor` VARCHAR(10) NOT NULL,
    `code_reco` VARCHAR(6) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `accounts` ADD CONSTRAINT `accounts_id_category_fkey` FOREIGN KEY (`id_category`) REFERENCES `categories_account`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounts` ADD CONSTRAINT `accounts_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
