import { Tabs } from 'expo-router';

import { PestanaHaptica } from '@/componentes/pestana-haptica';
import { IconoSimbolo } from '@/componentes/ui/icono-simbolo';
import { Colores } from '@/constantes/tema';

export default function DisposicionPestanas() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colores.marca.coral,
        tabBarInactiveTintColor: Colores.marca.apagado,
        tabBarLabelStyle: { fontFamily: 'System', fontSize: 11, fontWeight: '700' },
        tabBarStyle: {
          paddingTop: 8,
          borderTopColor: Colores.marca.linea,
          backgroundColor: Colores.marca.blanco,
        },
        headerShown: false,
        tabBarButton: PestanaHaptica,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Club',
          tabBarIcon: ({ color }) => <IconoSimbolo size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="salud"
        options={{
          title: 'Salud',
          tabBarIcon: ({ color }) => <IconoSimbolo size={28} name="heart.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="agenda"
        options={{
          title: 'Agenda',
          tabBarIcon: ({ color }) => <IconoSimbolo size={28} name="calendar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="historial"
        options={{
          title: 'Historial',
          tabBarIcon: ({ color }) => <IconoSimbolo size={28} name="doc.text.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
