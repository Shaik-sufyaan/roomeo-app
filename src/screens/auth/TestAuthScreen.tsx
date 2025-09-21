import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert
} from 'react-native'
import { useAuth } from '../../hooks/useAuth'

const TestAuthScreen: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)

  const {
    user,
    loading,
    error,
    emailSignIn,
    emailSignUp,
    googleSignIn,
    logout
  } = useAuth()

  const handleAuth = async () => {
    try {
      if (isSignUp) {
        await emailSignUp(email, password, name)
        Alert.alert('Success', 'Please check your email to verify your account')
      } else {
        await emailSignIn(email, password)
        Alert.alert('Success', 'Signed in successfully!')
      }
    } catch (error: any) {
      Alert.alert('Error', error.message)
    }
  }

  const handleGoogleAuth = async () => {
    try {
      await googleSignIn()
    } catch (error: any) {
      Alert.alert('Error', error.message)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      Alert.alert('Success', 'Signed out successfully')
    } catch (error: any) {
      Alert.alert('Error', error.message)
    }
  }

  if (user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>✅ Authentication Working!</Text>
          <Text style={styles.subtitle}>Welcome, {user.name || user.email}!</Text>

          <View style={styles.userInfo}>
            <Text style={styles.infoText}>ID: {user.id}</Text>
            <Text style={styles.infoText}>Email: {user.email}</Text>
            <Text style={styles.infoText}>Name: {user.name}</Text>
            <Text style={styles.infoText}>Type: {user.userType || 'Not set'}</Text>
            <Text style={styles.infoText}>Age: {user.age || 'Not set'}</Text>
            <Text style={styles.infoText}>Location: {user.location || 'Not set'}</Text>
            <Text style={styles.infoText}>Bio: {user.bio ? user.bio.substring(0, 50) + '...' : 'Not set'}</Text>
            <Text style={styles.infoText}>Profile Picture: {user.profilePicture ? 'Set' : 'Not set'}</Text>
            <Text style={styles.infoText}>Verified: {user.isVerified ? 'Yes' : 'No'}</Text>
            <Text style={styles.infoText}>Created: {user.createdAt.toLocaleDateString()}</Text>
            <Text style={styles.infoText}>Updated: {user.updatedAt.toLocaleDateString()}</Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleLogout}>
            <Text style={styles.buttonText}>Sign Out</Text>
          </TouchableOpacity>

          <Text style={styles.subtitle}>🎯 Ready for Phase 3: Navigation & UI</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🧪 Roomio Auth Test</Text>
        <Text style={styles.subtitle}>
          {isSignUp ? 'Create Account' : 'Sign In'}
        </Text>

        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        {isSignUp && (
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleAuth}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.googleButton]}
          onPress={handleGoogleAuth}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
          <Text style={styles.switchText}>
            {isSignUp
              ? 'Already have account? Sign In'
              : 'Need account? Sign Up'
            }
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F5F1',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#004D40',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#004D40',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#004D40',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  googleButton: {
    backgroundColor: '#44C76F',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchText: {
    color: '#004D40',
    textAlign: 'center',
    marginTop: 10,
    textDecorationLine: 'underline',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 15,
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 8,
  },
  userInfo: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
})

export default TestAuthScreen