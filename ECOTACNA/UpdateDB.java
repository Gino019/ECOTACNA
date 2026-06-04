import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;

public class UpdateDB {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&prepareThreshold=0";
        String user = "postgres.fhdnwwqiraybpakspegx";
        String password = "EcoTacnaJPA22";

        try (Connection conn = DriverManager.getConnection(url, user, password)) {
            String sql = "UPDATE companies SET business_name = 'ALIMENTOS TACNA HEROICA S.R.L.' WHERE ruc = '20519584892' AND business_name = 'Empresa 20519584892'";
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                int rows = stmt.executeUpdate();
                System.out.println("Updated rows: " + rows);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
