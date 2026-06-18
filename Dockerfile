# FROM node:22-alpine

# WORKDIR /app

# COPY package*.json ./

# RUN npm install

# COPY . .

# EXPOSE 3000

# CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]


# # ---------- Stage 1: Build  only for kubernities ----------
# FROM node:22-alpine AS build

# WORKDIR /app
# COPY package*.json ./
# RUN npm install
# COPY . .
# RUN npm run build

# # ---------- Stage 2: Serve ----------
# FROM nginx:alpine

# COPY --from=build /app/dist /usr/share/nginx/html
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# EXPOSE 80

# CMD ["nginx", "-g", "daemon off;"]


# devlopment mode docker file frontend

# -------- Stage 1: Build --------
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# -------- Stage 2: Serve --------
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]