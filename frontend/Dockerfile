# Use official lightweight Nginx image
FROM nginx:alpine

# Remove default Nginx HTML content
RUN rm -rf /usr/share/nginx/html/*

# Copy your frontend files (index.html, CSS, JS, etc.) into Nginx folder
COPY . /usr/share/nginx/html

# Expose Nginx default port
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
