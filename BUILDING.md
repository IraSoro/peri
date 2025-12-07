# How to build

## Web Application (Docker Compose)

The easiest way to run the web application is using Docker Compose, which sets up the frontend, backend API, and PostgreSQL database automatically.

### Prerequisites

- Docker and Docker Compose installed on your system

### Quick Start

1. Clone the repository and navigate to the project directory:

```shell
cd peri
```

2. Configure storage mode in `.env` file:

```shell
# For local storage (default)
VITE_STORAGE_MODE=local

# For remote storage with PostgreSQL
VITE_STORAGE_MODE=remote
VITE_API_BASE_URL=http://localhost:3001/api
```

3. Start the development environment:

```shell
docker compose up peri-dev
```

This will start:
- Frontend (Vite dev server) on `http://localhost:5173`
- Backend API server on `http://localhost:3001` (if remote mode)
- PostgreSQL database on `localhost:5432` (if remote mode)

4. Open your browser and navigate to `http://localhost:5173`

### Production Build

To run the production build:

```shell
docker compose --profile production up -d
```

This will start the production-optimized version on `http://localhost:8080`.

### Clean Up

To stop all containers and remove volumes:

```shell
docker compose down -v
```

## Web Application (Manual Setup)

Install dependencies:

```shell
npm install
```

After that, you can start development server, which will be useful for quickly testing your changes:

```shell
npm run dev
```

Once your dev server is running, you should see a link like `http://localhost:5173/` in your shell. Copy the link and paste it into your browser to see the running app.

### Remote Storage Backend Setup

If you want to use remote storage mode, you also need to set up the backend:

1. Navigate to the backend directory:

```shell
cd backend
npm install
```

2. Set up PostgreSQL database and configure the connection in `backend/.env`:

```shell
DATABASE_URL=postgresql://peri_user:peri_password@localhost:5432/peri_db
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

3. Start the backend server:

```shell
cd backend
npm run dev
```

The backend API will be available at `http://localhost:3001`.

## Android Application

To build the native `peri` you need `Android Studio` installed and all necessary JDK/SDK. To install, follow the instruction <https://developer.android.com/studio/install>.

After installing Android Studio, you need to run the following command:

```shell
npm run build # this command builds production-optimized Peri's code
npm install -g @ionic/cli@7.1.1 # this package will be installed globally to use capacitor
npx cap sync
npx cap add android
npx cap open android
```

An `android` directory will be generated and you can open it with `Android Studio` and build the project with the instructions in <https://capacitorjs.com/docs/android#running-with-android-studio>, starting from the **Running with Android Studio** section.

You can also create a development version of native `peri` using the following `Dockerfile`, just create it in the root of the `peri` project:

```dockerfile
FROM node:latest

WORKDIR /home/

RUN apt-get update && \
  apt-get install -y android-sdk openjdk-17-jdk && \
  wget -q https://redirector.gvt1.com/edgedl/android/studio/ide-zips/2022.2.1.20/android-studio-2022.2.1.20-linux.tar.gz && \
  tar -C /usr/local -xzf android-studio-2022.2.1.20-linux.tar.gz && \
  rm android-studio-2022.2.1.20-linux.tar.gz && \
  wget -q https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip && \
  unzip -q commandlinetools-linux-9477386_latest.zip && \
  mkdir -p /usr/lib/android-sdk/cmdline-tools/latest && \
  mv cmdline-tools/* /usr/lib/android-sdk/cmdline-tools/latest/ && \
  rm commandlinetools-linux-9477386_latest.zip && \
  yes | /usr/lib/android-sdk/cmdline-tools/latest/bin/sdkmanager --licenses && \
  npm -g install @ionic/cli@7.1.1

ENV ANDROID_HOME=/usr/lib/android-sdk/
ENV PATH=$PATH:${ANDROID_HOME}tools/:${ANDROID_HOME}platform-tools/

WORKDIR /home/app

ENTRYPOINT [ "bash" ]
```

And run:

```shell
docker build -t peri-android-env:latest .
```

After that, you can start the container with:

```shell
docker run -it --rm -v $(pwd):/home/app peri-android-env
```

This Docker image already has `@ionic/cli`, `Android Studio` and all necessary JDK/SDK installed. You can just run the following commands to build the `apk` file:

```shell
npm run build # this command builds production-optimized Peri's code
npx cap sync
npx cap add android # generates Android project
./android/gradlew -p android/ assembleDebug # build debug apk file
```

The `apk` file will be created at `peri/android/app/build/outputs/apk/debug/`. You can install it on your smartphone. During the installation phase, `Android` will show you a warning that you are trying to install a potentially harmful application, because your app is not signed. To get rid of this warning, you should build the application through `Android Studio` following the instructions above, the `Dockerfile`-based method is only suitable for building a test application so far.
