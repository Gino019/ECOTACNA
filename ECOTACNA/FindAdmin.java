import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class FindAdmin {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&prepareThreshold=0";
        String user = "postgres.fhdnwwqiraybpakspegx";
        String password = "EcoTacnaJPA22";

        try (Connection conn = DriverManager.getConnection(url, user, password)) {
            String sql = "SELECT email, role, enabled FROM users WHERE role = 'ADMIN'";
            try (Statement stmt = conn.createStatement(); ResultSet rs = stmt.executeQuery(sql)) {
                while (rs.next()) {
                    System.out.println("Admin user: " + rs.getString("email"));
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
