import React from 'react';
import { motion } from 'framer-motion';
import { Paper, Text, Group, Image, Box } from '@mantine/core';
import styles from './StudentCard.module.css';

const StudentCard = ({ student, isOpen, onClose }) => {
  return (
    <motion.div
      initial={{ scale: 0, borderRadius: '16px' }}
      animate={{
        scale: isOpen ? 1 : 0,
        borderRadius: '16px',
      }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20
      }}
      className={styles.studentCard}
    >
      <Paper
        radius="lg"
        p={0}
        className={styles.profilePaper}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Box p="xl">
            <Group position="apart" align="flex-start" mb="xl">
              <Group spacing="md">
                <Image
                  src="/logo.png"
                  alt="University Logo"
                  width={40}
                  height={40}
                  className={styles.logo}
                />
                <Text size="xl" weight={700} color="dark">
                  Student Card
                </Text>
              </Group>
              <motion.img
                src={student.photo || '/default-avatar.png'}
                alt={student.name}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 8,
                  objectFit: 'cover',
                  border: '4px solid white',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
              />
            </Group>

            <Box mb="xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Text size="xl" weight={700} color="dark">
                  {student.name}
                </Text>
                <Text size="md" color="dimmed">
                  {student.department}
                </Text>
              </motion.div>
            </Box>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Group position="apart" mb="md">
                <Text weight={500} color="dimmed">ID Студента</Text>
                <Text weight={700}>{student.id}</Text>
              </Group>

              <Group position="apart" mb="md">
                <Text weight={500} color="dimmed">Статус</Text>
                <Text weight={700} color="teal">Активен</Text>
              </Group>

              <Group position="apart">
                <Text weight={500} color="dimmed">Программа</Text>
                <Text weight={700}>{student.program}</Text>
              </Group>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              style={{ marginTop: 24 }}
            >
              <Paper
                radius="md"
                p="sm"
                className={styles.infoContainer}
              >
                <Text size="sm" align="center" color="dimmed">
                  Нажмите в любом месте, чтобы закрыть
                </Text>
              </Paper>
            </motion.div>
          </Box>
        </motion.div>
      </Paper>
    </motion.div>
  );
};

export default StudentCard;
