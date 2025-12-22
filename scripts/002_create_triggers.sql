-- Triggers for Sherdor Mebel Business Management System

-- Function to update Ombor (inventory) when new Tovarlar entry is added
CREATE OR REPLACE FUNCTION update_ombor()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update ombor record
  INSERT INTO ombor (tovar_nomi, raqami, jami_keltirilgan, jami_ishlatilgan, qoldiq, oxirgi_yangilanish)
  VALUES (
    NEW.tovar_nomi,
    NEW.raqami,
    CASE WHEN NEW.amal_turi = 'Olib keldi' THEN NEW.miqdor ELSE 0 END,
    CASE WHEN NEW.amal_turi = 'Ishlatildi' THEN NEW.miqdor ELSE 0 END,
    CASE WHEN NEW.amal_turi = 'Olib keldi' THEN NEW.miqdor ELSE -NEW.miqdor END,
    NOW()
  )
  ON CONFLICT (tovar_nomi, raqami)
  DO UPDATE SET
    jami_keltirilgan = ombor.jami_keltirilgan + CASE WHEN NEW.amal_turi = 'Olib keldi' THEN NEW.miqdor ELSE 0 END,
    jami_ishlatilgan = ombor.jami_ishlatilgan + CASE WHEN NEW.amal_turi = 'Ishlatildi' THEN NEW.miqdor ELSE 0 END,
    qoldiq = ombor.qoldiq + CASE WHEN NEW.amal_turi = 'Olib keldi' THEN NEW.miqdor ELSE -NEW.miqdor END,
    oxirgi_yangilanish = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for Tovarlar table
DROP TRIGGER IF EXISTS trigger_update_ombor ON tovarlar;
CREATE TRIGGER trigger_update_ombor
  AFTER INSERT ON tovarlar
  FOR EACH ROW
  EXECUTE FUNCTION update_ombor();

-- Function to archive completed orders/jobs
CREATE OR REPLACE FUNCTION archive_completed_record()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if qancha_qoldi is 0 (completed)
  IF NEW.qancha_qoldi = 0 AND OLD.qancha_qoldi != 0 THEN
    -- Determine module type and data based on table
    IF TG_TABLE_NAME = 'zakazlar' THEN
      INSERT INTO arxiv (
        id, modul_turi, mijoz_nomi_yoki_tovar_turi, raqami_yoki_miqdori,
        mijoz_turi, qanchaga_kelishildi, qancha_berdi, qancha_qoldi, izoh, sana
      ) VALUES (
        NEW.id, 'Zakaz', NEW.tovar_turi, NEW.raqami,
        NULL, NEW.qanchaga_kelishildi, NEW.qancha_berdi, NEW.qancha_qoldi, NEW.izoh, NOW()
      );
      -- Delete from original table
      DELETE FROM zakazlar WHERE id = NEW.id;
    ELSIF TG_TABLE_NAME = 'mebel' THEN
      INSERT INTO arxiv (
        id, modul_turi, mijoz_nomi_yoki_tovar_turi, raqami_yoki_miqdori,
        mijoz_turi, qanchaga_kelishildi, qancha_berdi, qancha_qoldi, izoh, sana
      ) VALUES (
        NEW.id, 'Mebel', NEW.mijoz_nomi, NEW.qancha_tovar_keltirdi,
        NEW.mijoz_turi, NEW.qanchaga_kelishildi, NEW.qancha_berdi, NEW.qancha_qoldi, NEW.izoh, NOW()
      );
      -- Delete from original table
      DELETE FROM mebel WHERE id = NEW.id;
    ELSIF TG_TABLE_NAME = 'kronka' THEN
      INSERT INTO arxiv (
        id, modul_turi, mijoz_nomi_yoki_tovar_turi, raqami_yoki_miqdori,
        mijoz_turi, qanchaga_kelishildi, qancha_berdi, qancha_qoldi, izoh, sana
      ) VALUES (
        NEW.id, 'Kronka', NEW.mijoz_nomi, NEW.qancha_lenta_urildi,
        NEW.mijoz_turi, NEW.qanchaga_kelishildi, NEW.qancha_berdi, NEW.qancha_qoldi, NEW.izoh, NOW()
      );
      -- Delete from original table
      DELETE FROM kronka WHERE id = NEW.id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for archiving completed records
DROP TRIGGER IF EXISTS trigger_archive_zakazlar ON zakazlar;
CREATE TRIGGER trigger_archive_zakazlar
  AFTER UPDATE ON zakazlar
  FOR EACH ROW
  EXECUTE FUNCTION archive_completed_record();

DROP TRIGGER IF EXISTS trigger_archive_mebel ON mebel;
CREATE TRIGGER trigger_archive_mebel
  AFTER UPDATE ON mebel
  FOR EACH ROW
  EXECUTE FUNCTION archive_completed_record();

DROP TRIGGER IF EXISTS trigger_archive_kronka ON kronka;
CREATE TRIGGER trigger_archive_kronka
  AFTER UPDATE ON kronka
  FOR EACH ROW
  EXECUTE FUNCTION archive_completed_record();
