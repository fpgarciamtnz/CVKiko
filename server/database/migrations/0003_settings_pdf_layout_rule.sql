ALTER TABLE `settings`
ADD COLUMN `pdf_layout_rule` text DEFAULT '{"enforceOnePage":true,"compactContactsInline":true,"minScale":0.72,"targetPage":"A4"}';
