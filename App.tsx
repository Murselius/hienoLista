import { StatusBar } from 'expo-status-bar';
import { FlatList, StyleSheet, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as SQLite from 'expo-sqlite';
import { useDrizzleStudio } from 'expo-drizzle-studio-plugin';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import {
  Appbar,
  Button,
  Divider,
  IconButton,
  List,
  PaperProvider,
  Text,
  TextInput,
} from 'react-native-paper';

type Purchase = {
  id: number;
  product: string;
  amount: string;
};

const BLUE = '#2089dc';
const GREY = '#86939e';

export default function App() {
  const [product, setProduct] = useState('');
  const [amount, setAmount] = useState('');
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const db = SQLite.openDatabaseSync('purchasedb');
  useDrizzleStudio(db);

  const handleFetch = async () => {
    try {
      const list = await db.getAllAsync<Purchase>(
        'SELECT id, product, amount FROM course'
      );
      setPurchases(list);
    } catch (error) {
      console.error('Could not get items', error);
    }
  };

  const initialize = async () => {
    try {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS course (
          id INTEGER PRIMARY KEY NOT NULL,
          product TEXT,
          amount TEXT
        );
      `);
      await handleFetch();
    } catch (error) {
      console.error('Could not open database', error);
    }
  };

  useEffect(() => {
    void initialize();
  }, []);

  const handleSave = async () => {
    const trimmedProduct = product.trim();
    const trimmedAmount = amount.trim();
    if (!trimmedProduct || !trimmedAmount) return;

    try {
      await db.runAsync(
        'INSERT INTO course (product, amount) VALUES (?, ?)',
        trimmedProduct,
        trimmedAmount
      );
      setProduct('');
      setAmount('');
      await handleFetch();
    } catch (error) {
      console.error('Could not add item', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await db.runAsync('DELETE FROM course WHERE id = ?', id);
      await handleFetch();
    } catch (error) {
      console.error('Could not delete item', error);
    }
  };

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <StatusBar style="light" />
        <Appbar.Header mode="center-aligned" style={styles.appbar}>
          <Appbar.Content title="SHOPPING LIST" titleStyle={styles.appbarTitle} />
        </Appbar.Header>

        <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
          <View style={styles.form}>
            <Text style={styles.label}>PRODUCT</Text>
            <TextInput
              mode="flat"
              placeholder="Product"
              value={product}
              onChangeText={setProduct}
              underlineColor={GREY}
              activeUnderlineColor={BLUE}
              textColor="#000"
              style={styles.input}
            />

            <Text style={styles.label}>AMOUNT</Text>
            <TextInput
              mode="flat"
              placeholder="Amount"
              value={amount}
              onChangeText={setAmount}
              underlineColor={GREY}
              activeUnderlineColor={BLUE}
              textColor="#000"
              style={styles.input}
            />

            <Button
              mode="contained"
              buttonColor={BLUE}
              style={styles.saveButton}
              labelStyle={styles.saveLabel}
              icon={({ size, color }) => (
                <MaterialDesignIcons name="content-save-outline" size={size} color={color} />
              )}
              onPress={() => void handleSave()}
            >
              SAVE
            </Button>
          </View>

          <FlatList
            style={styles.list}
            data={purchases}
            keyExtractor={(item) => item.id.toString()}
            ItemSeparatorComponent={Divider}
            ListFooterComponent={purchases.length > 0 ? <Divider /> : null}
            renderItem={({ item }) => (
              <List.Item
                title={item.product}
                description={item.amount}
                titleStyle={styles.itemTitle}
                descriptionStyle={styles.itemDescription}
                right={() => (
                  <IconButton
                    icon={({ size }) => (
                      <MaterialDesignIcons name="delete" size={size} color="red" />
                    )}
                    onPress={() => void handleDelete(item.id)}
                  />
                )}
              />
            )}
          />
        </SafeAreaView>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  appbar: {
    backgroundColor: BLUE,
  },
  appbarTitle: {
    color: '#fff',
    fontSize: 14,
  },
  form: {
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  label: {
    color: GREY,
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: 12,
    marginLeft: 2,
  },
  input: {
    backgroundColor: 'transparent',
    height: 48,
  },
  saveButton: {
    alignSelf: 'center',
    width: '75%',
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 2,
  },
  saveLabel: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  list: {
    marginTop: 16,
  },
  itemTitle: {
    fontSize: 16,
  },
  itemDescription: {
    fontSize: 14,
    color: GREY,
  },
});