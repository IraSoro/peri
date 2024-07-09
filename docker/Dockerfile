FROM node:latest

WORKDIR /home/

ARG OPENJDK_VERSION=17
# You can find latest `Android Studio` and `Command line tools`
# versions here https://developer.android.com/studio
ARG ANDROID_SDK_VERSION=2024.1.1.11
ARG COMMANDLINE_TOOLS_LINUX_VERSION=11076708_latest
ARG IONIC_CLI_VERSION=7.2.0

RUN apt-get update && \
  apt-get install -y android-sdk openjdk-${OPENJDK_VERSION}-jdk && \
  wget -q https://redirector.gvt1.com/edgedl/android/studio/ide-zips/${ANDROID_SDK_VERSION}/android-studio-${ANDROID_SDK_VERSION}-linux.tar.gz && \
  tar -C /usr/local -xzf android-studio-${ANDROID_SDK_VERSION}-linux.tar.gz && \
  rm android-studio-${ANDROID_SDK_VERSION}-linux.tar.gz && \
  wget -q https://dl.google.com/android/repository/commandlinetools-linux-${COMMANDLINE_TOOLS_LINUX_VERSION}.zip && \
  unzip -q commandlinetools-linux-${COMMANDLINE_TOOLS_LINUX_VERSION}.zip && \
  mkdir -p /usr/lib/android-sdk/cmdline-tools/latest && \
  mv cmdline-tools/* /usr/lib/android-sdk/cmdline-tools/latest/ && \
  rm commandlinetools-linux-${COMMANDLINE_TOOLS_LINUX_VERSION}.zip && \
  yes | /usr/lib/android-sdk/cmdline-tools/latest/bin/sdkmanager --licenses && \
  npm -g install @ionic/cli@${IONIC_CLI_VERSION}

ENV ANDROID_HOME=/usr/lib/android-sdk/
ENV PATH=$PATH:${ANDROID_HOME}tools/:${ANDROID_HOME}platform-tools/

WORKDIR /home/app

ENTRYPOINT [ "bash" ]
