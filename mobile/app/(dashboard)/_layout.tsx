import React from 'react';
import { Tabs } from 'expo-router';
import { Home, ShoppingCart, Bell, Users, MessageSquare } from 'lucide-react-native';

export default function DashboardLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(17, 17, 17, 0.95)',
          borderTopWidth: 1,
          borderTopColor: '#333333',
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          elevation: 0,
          borderRadius: 16,
          height: 70,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: '#d946ef',
        tabBarInactiveTintColor: '#a1a1aa',
        tabBarShowLabel: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="orders/index"
        options={{
          title: 'Compras',
          tabBarIcon: ({ color }) => <ShoppingCart size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="alerts/index"
        options={{
          title: 'Alertas',
          tabBarIcon: ({ color }) => <Bell size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="suppliers/index"
        options={{
          title: 'Fornecedores',
          tabBarIcon: ({ color }) => <Users size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="assistant/index"
        options={{
          title: 'Assistente',
          tabBarIcon: ({ color }) => <MessageSquare size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="commodities/[id]"
        options={{
          href: null, // Ocultar da tab bar
        }}
      />
    </Tabs>
  );
}
