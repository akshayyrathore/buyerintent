import requests
import sys
import json
from datetime import datetime
import time

class TwitterIntentAPITester:
    def __init__(self, base_url="https://tweetintent.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_id = None
        self.email = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        
        result = {
            "test": name,
            "status": "PASS" if success else "FAIL",
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status_icon = "✅" if success else "❌"
        print(f"{status_icon} {name}: {details}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            
            if success:
                try:
                    response_data = response.json()
                    details = f"Status: {response.status_code}"
                    if 'message' in response_data:
                        details += f", Message: {response_data['message']}"
                except:
                    details = f"Status: {response.status_code}"
            else:
                try:
                    error_data = response.json()
                    details = f"Expected {expected_status}, got {response.status_code}. Error: {error_data.get('detail', 'Unknown error')}"
                except:
                    details = f"Expected {expected_status}, got {response.status_code}. Response: {response.text[:200]}"

            self.log_test(name, success, details)
            return success, response.json() if success and response.content else {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_api_health(self):
        """Test API health endpoint"""
        success, response = self.run_test(
            "API Health Check",
            "GET",
            "",
            200
        )
        return success

    def test_signup(self):
        """Test user signup"""
        test_email = f"test_user_{int(time.time())}@example.com"
        test_password = "TestPass123!"
        
        success, response = self.run_test(
            "User Signup",
            "POST",
            "auth/signup",
            200,
            data={"email": test_email, "password": test_password}
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response['user_id']
            self.email = response['email']
            self.log_test("Token Extraction", True, f"User ID: {self.user_id}")
            return True
        return False

    def test_login_invalid(self):
        """Test login with invalid credentials"""
        success, _ = self.run_test(
            "Login Invalid Credentials",
            "POST",
            "auth/login",
            401,
            data={"email": "invalid@example.com", "password": "wrongpass"}
        )
        return success

    def test_login_valid(self):
        """Test login with valid credentials (using signup email)"""
        if not self.email:
            self.log_test("Login Valid Credentials", False, "No email from signup")
            return False
            
        success, response = self.run_test(
            "Login Valid Credentials",
            "POST",
            "auth/login",
            200,
            data={"email": self.email, "password": "TestPass123!"}
        )
        
        if success and 'token' in response:
            # Update token with login token
            self.token = response['token']
            return True
        return False

    def test_protected_endpoint_no_auth(self):
        """Test protected endpoint without authentication"""
        # Temporarily remove token
        temp_token = self.token
        self.token = None
        
        success, _ = self.run_test(
            "Protected Endpoint No Auth",
            "GET",
            "search/history",
            401
        )
        
        # Restore token
        self.token = temp_token
        return success

    def test_search_history_empty(self):
        """Test search history (should be empty initially)"""
        success, response = self.run_test(
            "Search History Empty",
            "GET",
            "search/history",
            200
        )
        
        if success and 'history' in response:
            history_count = len(response['history'])
            self.log_test("History Count Check", True, f"Found {history_count} history items")
            return True
        return False

    def test_datasets_empty(self):
        """Test datasets endpoint (should be empty initially)"""
        success, response = self.run_test(
            "Datasets Empty",
            "GET",
            "datasets",
            200
        )
        
        if success and 'datasets' in response:
            datasets_count = len(response['datasets'])
            self.log_test("Datasets Count Check", True, f"Found {datasets_count} dataset items")
            return True
        return False

    def test_twitter_search_minimal(self):
        """Test Twitter search with minimal query to conserve API calls"""
        # Use a very specific, low-volume search to minimize API usage
        search_data = {
            "location": "TestCity",
            "category": "TestCategory", 
            "keywords": ["test"]
        }
        
        success, response = self.run_test(
            "Twitter Search Minimal",
            "POST",
            "search/twitter",
            200,
            data=search_data
        )
        
        if success:
            tweet_count = response.get('count', 0)
            datasets_created = response.get('datasets_created', 0)
            self.log_test("Search Results Analysis", True, 
                         f"Found {tweet_count} tweets, created {datasets_created} datasets")
            
            # Verify response structure
            required_fields = ['search_query', 'expanded_terms', 'tweets', 'count', 'datasets_created']
            missing_fields = [field for field in required_fields if field not in response]
            
            if missing_fields:
                self.log_test("Response Structure Check", False, f"Missing fields: {missing_fields}")
            else:
                self.log_test("Response Structure Check", True, "All required fields present")
            
            return True
        return False

    def test_search_history_after_search(self):
        """Test search history after performing a search"""
        success, response = self.run_test(
            "Search History After Search",
            "GET",
            "search/history",
            200
        )
        
        if success and 'history' in response:
            history_count = len(response['history'])
            if history_count > 0:
                self.log_test("History Updated Check", True, f"Found {history_count} history items")
                
                # Check first history item structure
                first_item = response['history'][0]
                required_fields = ['id', 'location', 'category', 'keywords', 'created_at']
                missing_fields = [field for field in required_fields if field not in first_item]
                
                if missing_fields:
                    self.log_test("History Item Structure", False, f"Missing fields: {missing_fields}")
                else:
                    self.log_test("History Item Structure", True, "All required fields present")
                
                return True
            else:
                self.log_test("History Updated Check", False, "No history items found after search")
                return False
        return False

    def test_datasets_after_search(self):
        """Test datasets after performing a search"""
        success, response = self.run_test(
            "Datasets After Search",
            "GET",
            "datasets",
            200
        )
        
        if success and 'datasets' in response:
            datasets_count = len(response['datasets'])
            if datasets_count > 0:
                self.log_test("Datasets Updated Check", True, f"Found {datasets_count} dataset items")
                
                # Check first dataset item structure
                first_item = response['datasets'][0]
                required_fields = ['id', 'tweet_id', 'intent_label', 'reasoning', 'created_at', 'text', 'username', 'intent_score']
                missing_fields = [field for field in required_fields if field not in first_item]
                
                if missing_fields:
                    self.log_test("Dataset Item Structure", False, f"Missing fields: {missing_fields}")
                else:
                    self.log_test("Dataset Item Structure", True, "All required fields present")
                
                return True
            else:
                self.log_test("Datasets Updated Check", False, "No dataset items found after search")
                return False
        return False

    def test_invalid_search_data(self):
        """Test search with invalid/missing data"""
        # Test with missing fields
        invalid_data = {
            "location": "TestCity"
            # Missing category and keywords
        }
        
        success, _ = self.run_test(
            "Search Invalid Data",
            "POST",
            "search/twitter",
            422,  # Validation error
            data=invalid_data
        )
        return success

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting Twitter Intent API Tests...")
        print(f"📍 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Basic API tests
        if not self.test_api_health():
            print("❌ API health check failed - stopping tests")
            return False
            
        # Authentication tests
        if not self.test_signup():
            print("❌ Signup failed - stopping tests")
            return False
            
        self.test_login_invalid()
        self.test_login_valid()
        self.test_protected_endpoint_no_auth()
        
        # Data retrieval tests (empty state)
        self.test_search_history_empty()
        self.test_datasets_empty()
        
        # Search functionality tests
        self.test_invalid_search_data()
        
        # Perform actual search (conservatively)
        print("\n⚠️  Performing minimal Twitter search (conserving API rate limit)...")
        if self.test_twitter_search_minimal():
            # Test data after search
            time.sleep(1)  # Brief pause
            self.test_search_history_after_search()
            self.test_datasets_after_search()
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Tests completed: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            return False

def main():
    """Main test execution"""
    tester = TwitterIntentAPITester()
    
    try:
        success = tester.run_all_tests()
        
        # Save detailed results
        with open('/app/backend_test_results.json', 'w') as f:
            json.dump({
                'summary': {
                    'total_tests': tester.tests_run,
                    'passed_tests': tester.tests_passed,
                    'success_rate': f"{(tester.tests_passed/tester.tests_run*100):.1f}%" if tester.tests_run > 0 else "0%",
                    'timestamp': datetime.now().isoformat()
                },
                'detailed_results': tester.test_results
            }, f, indent=2)
        
        return 0 if success else 1
        
    except Exception as e:
        print(f"❌ Test execution failed: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())