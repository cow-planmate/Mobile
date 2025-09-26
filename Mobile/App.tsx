import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Button,
  ScrollView,
  StatusBar,
} from 'react-native';

function App() {
  const [text, setText] = useState('');
  const [destinations, setDestinations] = useState<string[]>([]);

  const handleAddDestination = () => {
    if (text.trim().length > 0) {
      setDestinations(prevDestinations => [...prevDestinations, text.trim()]);
      setText('');
    }
  };

  // --- ⭐️ 새로 추가된 부분: 삭제 함수 ---
  // index를 받아서 해당 위치의 항목을 제외한 새 배열을 만듭니다.
  const handleDeleteDestination = (indexToDelete: number) => {
    setDestinations(prevDestinations =>
      prevDestinations.filter((_, index) => index !== indexToDelete),
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={'dark-content'} />
      <Text style={styles.title}>PlanMate</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="여행지를 입력하세요..."
          onChangeText={setText}
          value={text}
        />
        <Button title="추가" onPress={handleAddDestination} />
      </View>

      <View style={styles.divider} />

      <ScrollView>
        {destinations.map((item, index) => (
          // --- ⭐️ 수정된 부분: View와 Button 추가 ---
          <View key={index} style={styles.destinationItem}>
            <Text style={styles.destinationText}>{item}</Text>
            <Button
              title="삭제"
              color="red"
              onPress={() => handleDeleteDestination(index)} // 해당 index로 삭제 함수 호출
            />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cccccc',
    paddingHorizontal: 10,
    marginRight: 10,
    borderRadius: 8,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
    marginBottom: 20,
  },
  destinationItem: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    // --- ⭐️ 추가된 부분: 텍스트와 버튼을 양옆으로 배치 ---
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  // --- ⭐️ 추가된 부분 ---
  destinationText: {
    fontSize: 16,
  },
});

export default App;
