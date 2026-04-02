# 🔧 eight_d_progress Kolonu Migration Talimatları

## ❌ Hata
```
Could not find the 'eight_d_progress' column of 'non_conformities' in the schema cache
```

## ✅ Çözüm

`non_conformities` tablosuna `eight_d_progress` JSONB kolonunu eklemek için aşağıdaki adımları izleyin:

### 📋 Adımlar

1. **Supabase Dashboard'a gidin:**
   ```
   https://app.supabase.com/project/ryvczrubujzlanvqiqlk/sql
   ```

2. **SQL Editor'ü açın**

3. **Aşağıdaki SQL'i kopyalayıp yapıştırın:**

   Dosya: `scripts/add-eight-d-progress-complete.sql`

4. **Run butonuna tıklayın**

5. **Başarılı mesajını bekleyin**

## 📄 SQL İçeriği

SQL dosyası şunları yapar:
- ✅ `exec_sql` RPC fonksiyonunu oluşturur (eğer yoksa)
- ✅ `non_conformities` tablosuna `eight_d_progress` JSONB kolonunu ekler
- ✅ Index oluşturur (performans için)
- ✅ Mevcut kayıtlar için varsayılan değer günceller

## 🎯 Sonuç

Migration tamamlandıktan sonra:
- ✅ 8D modülü sorunsuz çalışacak
- ✅ `eight_d_progress` kolonu kullanılabilir olacak
- ✅ Hata mesajı kaybolacak

## 📝 Notlar

- Migration güvenlidir (`IF NOT EXISTS` kullanıldı)
- Mevcut veriler korunur
- Geri alınamaz (kolon silinirse veriler kaybolur)

