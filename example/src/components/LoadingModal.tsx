import * as React from 'react';
import { HeadingText } from './text';
import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native';

export function LoadingModal({
  show,
  title,
}: {
  show: boolean;
  title: string;
}) {
  return (
    <StandardModal show={show}>
      <>
        <HeadingText>{title}</HeadingText>
        <ActivityIndicator />
      </>
    </StandardModal>
  );
}

export function StandardModal({
  show,
  children,
}: {
  show: boolean;
  children: React.ReactNode;
}) {
  return (
    <Modal visible={show} transparent>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>{children}</View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: '#212121',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
