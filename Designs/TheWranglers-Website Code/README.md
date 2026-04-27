# TheWranglers
CSCE 483 Senior Capstone

The objective of this project is to design and prototype a system that will reduce the amount of time necessary to pick up students from school. The system will allow parents to update their information (license plate numbers, approved adults for pickup, car rider schedules) via a website with approval from a staff member of the school. The system will read the marker on the car (license plate, QR code, nametag) as it enters the pickup line and send the information to a server. The server will identify the parent and child associated with the car marker, and update a display at the entrance of the pickup line to direct the car to the proper station. The laptop at the front of the school is updated to inform the students and staff which child is being picked up, and which zone to go to

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

# Setting Up the Database:

This project uses supabase for backend data storage. 

## Supabase Setup:
1. Go to the Supabase Dashboard (https://supabase.com/dashboard/) and create a new project
2. After creating the project, click on connect at the top next to your database name
3. Select App frameworks and select React and Create react  app from the dropdown menus and copy the env.local keys for later
4. Add tables to the postgres server 


# Environment variables:
There are several different environment variables you need to add in order to get the website to run. A template has been provided in .env.example to ensure that you include all necessary ones. 
1. Add Supabase environment variables REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY (see section on supabase setup to see how to get them)
2. Add Google Auth tokens (see section on google auth to learn how to get these)


