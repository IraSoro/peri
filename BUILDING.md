# How to build

Install dependencies:

```shell
npm install
```

After that, you can start development server, which will be useful for quickly testing your changes:

```shell
npm start
```

To build the native `peri` you need `Android Studio` installed and all necessary JDK/SDK. To install, follow the instruction <https://developer.android.com/studio/install>.

After installing Android Studio, you need to run the following command:

```shell
npm run build # this command builds production-optimized Peri's code
npm install -g @ionic/cli@7.1.1 # this package will be installed globally to use capacitor
ionic cap build android # generates Android project
```

An `android` directory will be generated and you can open it with `Android Studio` and build the project based on this instruction <https://capacitorjs.com/docs/android>

You can also create a development version of native `peri` using the `Docker` image. To to this you should run the following command:

```shell
docker build -f docker/Dockerfile -t peri-android-env:latest .
```

After that, you can start the container with:

```shell
docker run -it --rm -v $(pwd):/home/app peri-android-env
```

This Docker image already has `@ionic/cli`, `Android Studio` and all necessary JDK/SDK installed. You can just run the following commands to build the `apk` file:

```shell
npm run build # this command builds production-optimized Peri's code
ionic cap build android # generates Android project
cd android
./gradlew assembleDebug
```

The `apk` file will be created at `peri/android/app/build/outputs/apk/debug/`. You can install it on your smartphone. During the installation phase, `Android` will show you a warning that you are trying to install a potentially harmful application, because your app is not signed. To get rid of this warning, you should build the application through `Android Studio` following the instructions above, the `Dockerfile`-based method is only suitable for building a test application so far.
