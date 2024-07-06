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
