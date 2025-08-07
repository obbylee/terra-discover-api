FROM oven/bun as builder

WORKDIR /app

# Copy all project files into the container first.
# This ensures that any 'postinstall' scripts can find necessary files like prisma/schema.prisma.
COPY . .

# Install dependencies.
# The `postinstall` script (if it exists) will now run successfully.
RUN bun install

# Generate Prisma client again, explicitly.
# Although 'bun install' might do this, it's good practice to run it separately
# to ensure the Prisma client is always generated with the latest schema.
RUN bunx prisma generate

# --- Start of Final Image Stage ---
FROM oven/bun

WORKDIR /app

# Copy built artifacts from the 'builder' stage.
COPY --from=builder /app .

EXPOSE 3000

# Your main command to run the application.
CMD ["bun", "start:migrate:production"]