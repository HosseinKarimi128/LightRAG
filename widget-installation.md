# LightRAG Chat Widget Installation Guide

The LightRAG chat widget allows you to embed your AI assistant on any website. Follow these steps to install it.

## Basic Installation

Add this script to the `<head>` section of your website:

```html
<script>
  (function () {
    // Prevent duplicate loading
    if (window.hokaChatWidgetLoaded) return;
    window.hokaChatWidgetLoaded = true;

    const script = document.createElement('script');
    script.src = 'https://<your-server-domain>/webui/widget.js';
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
  })();
</script>
```

## Advanced Configuration

To customize the widget behavior, set these global variables before loading the widget:

```html
<script>
  // Optional: Set your server URL if different from current domain
  window.LIGHT_RAG_SERVER_URL = 'https://your-lightrag-server.com';
  
  // Optional: Set your API key if authentication is required
  window.LIGHT_RAG_API_KEY = 'your-api-key-here';
</script>

<script>
  (function () {
    // Prevent duplicate loading
    if (window.hokaChatWidgetLoaded) return;
    window.hokaChatWidgetLoaded = true;

    const script = document.createElement('script');
    script.src = 'https://<your-server-domain>/webui/widget.js';
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
  })();
</script>
```

## URL Configuration

- Replace `https://<your-server-domain>` with the actual URL of your LightRAG server
- The widget will automatically use your server's API endpoint unless `LIGHT_RAG_SERVER_URL` is specified

## Security Notes

- If using API key authentication, ensure it's only used on trusted domains
- The widget includes security measures to prevent XSS attacks
- API keys should be treated as sensitive information

## Example Usage

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Website</title>
    
    <!-- Optional: Set configuration before loading widget -->
    <script>
        window.LIGHT_RAG_SERVER_URL = 'https://my-lightrag-server.com';
        window.LIGHT_RAG_API_KEY = 'sk-1234567890';
    </script>
    
    <!-- Load the chat widget -->
    <script>
      (function () {
        if (window.hokaChatWidgetLoaded) return;
        window.hokaChatWidgetLoaded = true;

        const script = document.createElement('script');
        script.src = 'https://my-lightrag-server.com/webui/widget.js';
        script.async = true;
        script.defer = true;
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);
      })();
    </script>
</head>
<body>
    <h1>My Website</h1>
    <p>Content of my website...</p>
</body>
</html>
```

The widget will appear as a floating chat button in the bottom-left corner of the screen when loaded.