#!/bin/bash

# Script'in çalıştığı klasörü bul
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "========================================="
echo "Ağız ve Diş Sağlığı Takip Uygulaması"
echo "Sistem Başlatılıyor..."
echo "========================================="

echo "1. Eski oturumlar temizleniyor..."
lsof -ti :5146 | xargs kill -9 2>/dev/null || true
lsof -ti :5175 | xargs kill -9 2>/dev/null || true

echo "2. Veritabanı (Docker) başlatılıyor..."
docker-compose up -d

echo "3. Arka Uç (API) başlatılıyor..."
# Mac'te yeni bir Terminal penceresi açıp API'yi çalıştırır
osascript -e "tell app \"Terminal\" to do script \"cd '$DIR/DentalHealthTracker.API' && echo 'Arka Uç (API) Sunucusu' && dotnet run\""

echo "4. Ön Yüz (React) başlatılıyor..."
# Mac'te yeni bir Terminal penceresi daha açıp React'ı çalıştırır
osascript -e "tell app \"Terminal\" to do script \"cd '$DIR/client' && echo 'Ön Yüz (React) Sunucusu' && npm run dev\""

echo "========================================="
echo "Başlatma tamamlandı!"
echo "Uygulama tarayıcınızda otomatik olarak açılacaktır..."
echo "========================================="

# React'in hazır olması için birkaç saniye bekleyip tarayıcıyı açar
sleep 4
open "http://localhost:5175"
