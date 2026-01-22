FOLLOWED THE TUTORIAL ON:

https://alpen-webdesign.at/webtech2/

just make sure to add the .env file, cause .gitignore does not commit the .env file contents
also it doesn't commit the node_modules folder, so have to 'npm install' both folders backend, frontend.

DATABASE_URL="file:./dev.db"
JWT_SECRET=dev-secret-change-this
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123

as it was on the site

