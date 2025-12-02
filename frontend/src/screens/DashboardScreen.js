import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import client from '../api/client';

const DashboardScreen = () => {
    const [todos, setTodos] = useState([]);
    const [newTodo, setNewTodo] = useState('');
    const [loading, setLoading] = useState(true);

    const [feedback, setFeedback] = useState('');

    const showFeedback = (message) => {
        setFeedback(message);
        setTimeout(() => setFeedback(''), 3000);
    };

    const fetchTodos = async () => {
        try {
            const response = await client.get('/todos/');
            setTodos(response.data);
        } catch (e) {
            console.log(e);
            const message = e.response?.data?.detail || e.message || 'Failed to fetch todos';
            Alert.alert('Error', message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTodos();
    }, []);

    const addTodo = async () => {
        if (newTodo.trim().length === 0) return;
        try {
            const response = await client.post('/todos/', { title: newTodo });
            setTodos([...todos, response.data]);
            setNewTodo('');
            showFeedback('Task added successfully!');
        } catch (e) {
            Alert.alert('Error', 'Failed to add todo');
        }
    };

    const toggleComplete = async (id, currentStatus) => {
        try {
            const response = await client.patch(`/todos/${id}`, { completed: !currentStatus });
            setTodos(todos.map(todo => todo.id === id ? response.data : todo));
            showFeedback(currentStatus ? 'Task marked as incomplete' : 'Task marked as done!');
        } catch (e) {
            Alert.alert('Error', 'Failed to update todo');
        }
    };

    const deleteTodo = async (id) => {
        try {
            await client.delete(`/todos/${id}`);
            setTodos(todos.filter(todo => todo.id !== id));
            showFeedback('Task deleted successfully!');
        } catch (e) {
            Alert.alert('Error', 'Failed to delete todo');
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.todoItem}>
            <TouchableOpacity style={styles.todoTextContainer} onPress={() => toggleComplete(item.id, item.completed)}>
                <View style={[styles.checkbox, item.completed && styles.checkboxChecked]} />
                <Text style={[styles.todoText, item.completed && styles.todoTextCompleted]}>{item.title}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteTodo(item.id)}>
                <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>My Tasks</Text>
                {feedback ? <Text style={styles.feedbackText}>{feedback}</Text> : null}

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Add a new task..."
                        value={newTodo}
                        onChangeText={setNewTodo}
                    />
                    <TouchableOpacity style={styles.addButton} onPress={addTodo}>
                        <Text style={styles.addButtonText}>+</Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#007AFF" />
                ) : (
                    <FlatList
                        data={todos}
                        renderItem={renderItem}
                        keyExtractor={item => item.id.toString()}
                        contentContainerStyle={styles.list}
                        ListEmptyComponent={<Text style={styles.emptyText}>No tasks yet. Add one above!</Text>}
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    input: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 15,
        borderRadius: 10,
        fontSize: 16,
        marginRight: 10,
    },
    addButton: {
        backgroundColor: '#007AFF',
        width: 50,
        height: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    list: {
        paddingBottom: 20,
    },
    todoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15,
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        marginBottom: 10,
    },
    todoTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#007AFF',
        marginRight: 10,
    },
    checkboxChecked: {
        backgroundColor: '#007AFF',
    },
    todoText: {
        fontSize: 16,
        color: '#333',
    },
    todoTextCompleted: {
        textDecorationLine: 'line-through',
        color: '#aaa',
    },
    deleteText: {
        color: '#FF3B30',
        fontWeight: 'bold',
    },
    emptyText: {
        textAlign: 'center',
        color: '#999',
        marginTop: 50,
        fontSize: 16,
    },
    feedbackText: {
        color: 'green',
        marginBottom: 10,
        textAlign: 'center',
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default DashboardScreen;
