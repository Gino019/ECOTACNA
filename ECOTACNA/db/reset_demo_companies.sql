BEGIN;

CREATE TEMP TABLE tmp_demo_companies AS
SELECT id
FROM companies
WHERE ruc IN (
  '20611111111',
  '20622222222',
  '20633333333',
  '20555555555',
  '20566666666'
);

CREATE TEMP TABLE tmp_demo_users AS
SELECT id
FROM users
WHERE company_id IN (SELECT id FROM tmp_demo_companies)
   OR email IN (
      'demo.generador.01@ecotacna.test',
      'demo.generador.02@ecotacna.test',
      'demo.recolector.01@ecotacna.test',
      'demo.recolector.02@ecotacna.test',
      'demo.generador.reset01@ecotacna.test',
      'demo.recolector.reset01@ecotacna.test',
      'demo.generador.manual01@ecotacna.test',
      'demo.recolector.manual01@ecotacna.test',
      'demo.generador.manual02@ecotacna.test',
      'demo.recolector.manual02@ecotacna.test'
   );

-- Verificación previa: mostrar qué empresas y usuarios serán borrados.
SELECT id, ruc, business_name, company_type, subscription_status
FROM companies
WHERE id IN (SELECT id FROM tmp_demo_companies);

SELECT id, email, role, company_id
FROM users
WHERE id IN (SELECT id FROM tmp_demo_users);

DELETE FROM audit_logs
WHERE user_id IN (SELECT id FROM tmp_demo_users);

DELETE FROM payments
WHERE company_id IN (SELECT id FROM tmp_demo_companies);

DELETE FROM subscriptions
WHERE company_id IN (SELECT id FROM tmp_demo_companies);

-- Columnas ajustadas a las entidades reales de Hibernate (PickupRequest.java)
DELETE FROM pickup_requests
WHERE company_id IN (SELECT id FROM tmp_demo_companies)
   OR collector_user_id IN (SELECT id FROM tmp_demo_users);

-- Columnas ajustadas a las entidades reales de Hibernate (TransportUnit.java)
DELETE FROM transport_units
WHERE collector_company_id IN (SELECT id FROM tmp_demo_companies);

DELETE FROM users
WHERE id IN (SELECT id FROM tmp_demo_users);

DELETE FROM companies
WHERE id IN (SELECT id FROM tmp_demo_companies);

DROP TABLE tmp_demo_users;
DROP TABLE tmp_demo_companies;

COMMIT;
