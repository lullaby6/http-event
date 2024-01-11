# HTTP Event Library

## Overview

This library, named `http-event`, simplifies the process of handling HTTP events in the browser by providing a declarative approach to bind HTML elements with HTTP requests. It leverages the native Fetch API to perform HTTP requests and includes various options for customization.

## Installation

Include the `http-event.js` file in your project:

```html
<script src="path/to/http-event.js"></script>
```

## Usage

To use the library, follow these steps:

1. **Include the Script:**
   Include the `http-event.js` script in your HTML file.

2. **Declare HTML Elements:**
   Add the `he-event` attribute to HTML elements that should trigger HTTP events. Specify the type of event using the `he-event` attribute.

   ```html
   <button he-event="click" he-url="/api/data" he-method="GET">Load Data</button>
   <form he-event="submit" he-url="/api/submit" he-method="POST">
       <!-- Form fields go here -->
   </form>
   ```

3. **Configure Attributes:**
   Customize the HTTP request by adding attributes to the HTML elements.

   - `he-url`: Specifies the URL for the HTTP request.
   - `he-method`: Specifies the HTTP method (default is GET).
   - `he-authentication`: Adds an authentication header.
   - `he-authorization`: Adds an authorization header.
   - `he-headers`: Provides additional headers in JSON format.
   - `he-headers-storage`: Retrieves headers from local storage.

   Example:

   ```html
   <button he-event="click" he-url="/api/data" he-method="GET" he-authentication="Bearer token">Load Data</button>
   ```

4. **Handle Responses:**
   Customize the handling of the HTTP response using various attributes.

   - `he-json`: Parses the response as JSON.
   - `he-log`: Logs the response data to the console.
   - `he-storage`: Stores the response data in local storage.
   - `he-run`: Executes a script after receiving the response.

   Example:

   ```html
   <div he-event="click" he-url="/api/data" he-method="GET" he-json he-log he-run="console.log('Response received!')">Load Data</div>
   ```

5. **Update UI:**
   Update the UI based on the response by specifying a target element using the `he-target` attribute. Choose a swap method (`he-swap`) and optionally set attributes (`he-attr`).

   Example:

   ```html
   <div he-event="click" he-url="/api/data" he-method="GET" he-target="#result" he-swap="innerHTML" he-attr="data-info">Load Data</div>
   ```

6. **Redirect (Optional):**
   Optionally, redirect to a different URL after receiving the response.

   ```html
   <form he-event="submit" he-url="/api/submit" he-method="POST" he-redirect="/success">Submit Form</form>
   ```

## Why `http-event`?

The `http-event` library simplifies the integration of HTTP requests in the browser by providing a declarative and easy-to-use approach. It minimizes the boilerplate code needed to handle HTTP events, making it suitable for projects where simplicity and efficiency are crucial.