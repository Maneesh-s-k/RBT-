FROM alpine:latest

# Install dependencies using apk (Alpine package manager)
RUN apk update && \
    apk add --no-cache \
    g++ \
    make \
    curl \
    clang \
    musl-dev

# Set working directory
WORKDIR /app

# Copy current directory to /app
COPY . .

# Build the application
RUN make

# Expose port
EXPOSE 8080

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Start the application
CMD ["./rbtree_server"]
