import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseAuthUser, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updatePassword, reauthenticateWithCredential, EmailAuthProvider, deleteUser } from 'firebase/auth';
import { auth } from '../util/firebaseConfig';
import { saveUserInfo, getUserInfo, updateUserInfo, addDrinkLog, getAllDrinkLogs, deleteDrinkLog, deleteUserAccount } from '../api/firestore';
import { UserInfo, AuthState, DrinkLog, IntakeHistoryType } from '../storage/userinfo/type';
import { format } from 'date-fns';
import { calculateWaterIntake } from '../screens/userInfo/util';
import { scheduleMorningNotification, scheduleBedtimeNotification, sendGoalAchievedNotification, startReminder, clearGoalAchievedFlag } from '../screens/drinkReminder/util';
import { Platform } from 'react-native';
import * as LocalStorage from '../storage/localStorage';
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isNewUser: false,
};

interface UserAuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  handleOnboardingComplete: (data: Omit<UserInfo, 'userId' | 'dailyIntake' | 'isCompleted'>) => Promise<void>;
  addWaterLog: (volume: number, drinkType: string, defaultCupId?: number) => Promise<void>;
  updateUserDailyIntake: (intake: number) => Promise<void>;
  userWaterIntakeHistory: IntakeHistoryType[];
  handleHistoryDelete: (id: string) => Promise<void>;
  updateUserInfo: (value: any, field: string) => Promise<void>;
  updateMultipleUserInfo: (updates: Record<string, any>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  verifyCurrentPassword: (password: string) => Promise<boolean>;
  deleteAccount: (password: string) => Promise<void>;
  isRegistered: boolean;
  syncToCloud: () => Promise<void>;
}

export const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined);
export const UserAuthContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(initialState);
  const [waterIntakeHistory, setWaterIntakeHistory] = useState<IntakeHistoryType[]>([]);
  const [isRegistered, setIsRegisteredState] = useState<boolean>(false);

  const convertDrinkLogsToHistory = (logs: DrinkLog[]): IntakeHistoryType[] => {
    const sortedLogs = [...logs].sort((a, b) => {
      const createdAtA = a.createdAt || 0;
      const createdAtB = b.createdAt || 0;
      if (createdAtB !== createdAtA) {
        return createdAtB - createdAtA;
      }
      const timeA = a.time || '00:00:00';
      const timeB = b.time || '00:00:00';
      const timePartsA = timeA.split(':').map(Number);
      const timePartsB = timeB.split(':').map(Number);

      for (let i = 0; i < 3; i++) {
        if (timePartsB[i] !== timePartsA[i]) {
          return timePartsB[i] - timePartsA[i]; // Descending order
        }
      }
      return 0;
    });

    return sortedLogs.map(log => {
      let defaultCupId = log.defaultCupId;
      if (!defaultCupId || defaultCupId === 0) {
        defaultCupId = 4;
      }
      return {
        id: log.logId,
        date: log.date,
        time: log.time,
        amount: log.volume.toString(),
        drinkType: log.drinkType,
        defaultCupId: defaultCupId,
      };
    });
  };

  useEffect(() => {
    const loadHistory = async () => {
      if (authState.user?.userId) {
        const firebaseUser = auth.currentUser;
        const isFirebaseAuthenticated = firebaseUser !== null && isRegistered;

        if (isFirebaseAuthenticated) {
          try {
            const logs = await getAllDrinkLogs(authState.user.userId);
            setWaterIntakeHistory(convertDrinkLogsToHistory(logs));
            const today = format(new Date(), 'yyyy-MM-dd');
            const todayLogs = logs.filter(log => log.date === today);
            const calculatedDailyIntake = todayLogs.reduce((sum, log) => sum + log.volume, 0);

            if (authState.user && authState.user.dailyIntake !== calculatedDailyIntake) {
              const updatedUserInfo = {
                ...authState.user,
                dailyIntake: calculatedDailyIntake,
              };
              await LocalStorage.saveUserInfoLocal(updatedUserInfo);
              await updateUserInfo(authState.user.userId, {
                dailyIntake: calculatedDailyIntake,
              });

              setAuthState(prev => ({
                ...prev,
                user: updatedUserInfo,
              }));
            }
          } catch (error: any) {
            if (error?.code === 'permission-denied' || error?.message?.includes('permissions')) {
              console.warn('Firestore permissions denied, using local data (user may not be logged in)');
            } else {
              console.error('Error loading history from Firestore, falling back to local:', error);
            }
            try {
              const localLogs = await LocalStorage.getAllDrinkLogsLocal();
              if (localLogs && Array.isArray(localLogs)) {
                setWaterIntakeHistory(convertDrinkLogsToHistory(localLogs));

                if (authState.user) {
                  const today = format(new Date(), 'yyyy-MM-dd');
                  const todayLogs = localLogs.filter(log => log.date === today);
                  const calculatedDailyIntake = todayLogs.reduce((sum, log) => sum + (log.volume || 0), 0);

                  if (authState.user.dailyIntake !== calculatedDailyIntake) {
                    const updatedUserInfo = {
                      ...authState.user,
                      dailyIntake: calculatedDailyIntake,
                    };
                    await LocalStorage.saveUserInfoLocal(updatedUserInfo);

                    setAuthState(prev => ({
                      ...prev,
                      user: updatedUserInfo,
                    }));
                  }
                }
              } else {
                setWaterIntakeHistory([]);
              }
            } catch (localError) {
              console.error('Error loading local drink logs in catch block:', localError);
              setWaterIntakeHistory([]);
            }
          }
        } else {
          try {
            const localLogs = await LocalStorage.getAllDrinkLogsLocal();
            if (localLogs && Array.isArray(localLogs)) {
              setWaterIntakeHistory(convertDrinkLogsToHistory(localLogs));

              if (authState.user) {
                const today = format(new Date(), 'yyyy-MM-dd');
                const todayLogs = localLogs.filter(log => log.date === today);
                const calculatedDailyIntake = todayLogs.reduce((sum, log) => sum + (log.volume || 0), 0);

                if (authState.user.dailyIntake !== calculatedDailyIntake) {
                  const updatedUserInfo = {
                    ...authState.user,
                    dailyIntake: calculatedDailyIntake,
                  };
                  await LocalStorage.saveUserInfoLocal(updatedUserInfo);

                  setAuthState(prev => ({
                    ...prev,
                    user: updatedUserInfo,
                  }));
                }
              }
            } else {
              setWaterIntakeHistory([]);
            }
          } catch (error) {
            console.error('Error loading local drink logs:', error);
            setWaterIntakeHistory([]);
          }
        }
      } else {
        setWaterIntakeHistory([]);
      }
    };
    loadHistory();
  }, [authState.user?.userId, isRegistered]);

  useEffect(() => {
    let unsubscribeAuth: (() => void) | undefined;

    const initializeApp = async () => {
      try {
        const currentFirebaseUser = auth.currentUser;

        if (currentFirebaseUser) {
          setIsRegisteredState(true);

          try {
            const cloudInfo = await getUserInfo(currentFirebaseUser.uid);
            if (cloudInfo) {
              const today = format(new Date(), 'yyyy-MM-dd');
              const lastResetDate = cloudInfo.lastResetDate || today;
              let updatedInfo = cloudInfo;

              if (lastResetDate !== today) {
                updatedInfo = {
                  ...cloudInfo,
                  dailyIntake: 0,
                  lastResetDate: today,
                };
                await updateUserInfo(currentFirebaseUser.uid, {
                  dailyIntake: 0,
                  lastResetDate: today,
                });
              }

              await LocalStorage.saveUserInfoLocal(updatedInfo);
              await LocalStorage.setIsRegistered(true);

              setAuthState({
                user: updatedInfo,
                isAuthenticated: true,
                isLoading: false,
                isNewUser: !updatedInfo.isCompleted,
              });

              if (updatedInfo.isCompleted && Platform.OS !== 'web') {
                if (updatedInfo.wakeUpTime) {
                  scheduleMorningNotification(updatedInfo).catch(error => {
                    console.error('Error scheduling morning notification:', error);
                  });
                }
                if (updatedInfo.bedTime) {
                  scheduleBedtimeNotification(updatedInfo).catch(error => {
                    console.error('Error scheduling bedtime notification:', error);
                  });
                }
              }
            } else {
              const today = format(new Date(), 'yyyy-MM-dd');
              const defaultInfo: UserInfo = {
                userId: currentFirebaseUser.uid,
                name: '',
                weight: 0,
                height: 0,
                age: 0,
                gender: 'Other',
                activity: 'sendatry',
                climate: 'temperate',
                wakeUpTime: '07:00',
                bedTime: '23:00',
                dailyGoal: 0,
                dailyIntake: 0,
                lastResetDate: today,
                isCompleted: false,
                cupSize: 200,
              };
              await LocalStorage.saveUserInfoLocal(defaultInfo);
              setAuthState({
                user: defaultInfo,
                isAuthenticated: true,
                isLoading: false,
                isNewUser: true,
              });
            }
          } catch (error) {
            console.error('Error loading from Firestore, falling back to local:', error);
            await loadFromLocalStorage();
          }
        } else {
          await loadFromLocalStorage();
        }
        unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser: FirebaseAuthUser | null) => {
          if (firebaseUser) {
            setIsRegisteredState(true);
            try {
              const cloudInfo = await getUserInfo(firebaseUser.uid);
              if (cloudInfo) {
                const today = format(new Date(), 'yyyy-MM-dd');
                const lastResetDate = cloudInfo.lastResetDate || today;
                let updatedInfo = cloudInfo;

                if (lastResetDate !== today) {
                  updatedInfo = {
                    ...cloudInfo,
                    dailyIntake: 0,
                    lastResetDate: today,
                  };
                  await updateUserInfo(firebaseUser.uid, {
                    dailyIntake: 0,
                    lastResetDate: today,
                  });
                }

                await LocalStorage.saveUserInfoLocal(updatedInfo);
                await LocalStorage.setIsRegistered(true);

                try {
                  const logs = await getAllDrinkLogs(firebaseUser.uid);
                  const today = format(new Date(), 'yyyy-MM-dd');
                  const todayLogs = logs.filter(log => log.date === today);
                  const calculatedDailyIntake = todayLogs.reduce((sum, log) => sum + log.volume, 0);

                  if (updatedInfo.dailyIntake !== calculatedDailyIntake) {
                    updatedInfo.dailyIntake = calculatedDailyIntake;
                    await LocalStorage.saveUserInfoLocal(updatedInfo);
                    await updateUserInfo(firebaseUser.uid, {
                      dailyIntake: calculatedDailyIntake,
                    });
                  }
                } catch (logError) {
                  console.error('Error recalculating dailyIntake in onAuthStateChanged:', logError);
                }

                setAuthState(prev => ({
                  ...prev,
                  user: updatedInfo,
                  isAuthenticated: true,
                }));
              }
            } catch (error: any) {
              if (error?.code === 'permission-denied' || error?.message?.includes('permissions')) {
                console.warn('Firestore permissions denied (user may not be logged in)');
              } else {
                console.error('Error syncing with Firestore:', error);
              }
            }
          } else {
            setIsRegisteredState(false);
            await LocalStorage.setIsRegistered(false);
          }
        });
      } catch (error) {
        console.error('Error initializing app:', error);
        await loadFromLocalStorage();
      }
    };

    const loadFromLocalStorage = async () => {
      try {
        const registered = await LocalStorage.getIsRegistered();
        setIsRegisteredState(registered);

        let localUserInfo = await LocalStorage.getUserInfoLocal();

        if (!localUserInfo) {
          const localUserId = await LocalStorage.getLocalUserId();
          const today = format(new Date(), 'yyyy-MM-dd');
          localUserInfo = {
            userId: localUserId,
            name: '',
            weight: 0,
            height: 0,
            age: 0,
            gender: 'Other',
            activity: 'sendatry',
            climate: 'temperate',
            wakeUpTime: '07:00',
            bedTime: '23:00',
            dailyGoal: 0,
            dailyIntake: 0,
            lastResetDate: today,
            isCompleted: false,
            cupSize: 200,
          };
          await LocalStorage.saveUserInfoLocal(localUserInfo);
        } else {
          const today = format(new Date(), 'yyyy-MM-dd');
          const lastResetDate = localUserInfo.lastResetDate || today;
          if (lastResetDate !== today) {
            localUserInfo = {
              ...localUserInfo,
              dailyIntake: 0,
              lastResetDate: today,
            };
            await LocalStorage.saveUserInfoLocal(localUserInfo);
          }
        }

        setAuthState({
          user: localUserInfo,
          isAuthenticated: true,
          isLoading: false,
          isNewUser: !localUserInfo.isCompleted,
        });
      } catch (error) {
        console.error('Error loading local data:', error);
        setAuthState({ ...initialState, isLoading: false });
      }
    };

    initializeApp();

    return () => {
      if (unsubscribeAuth) {
        unsubscribeAuth();
      }
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      setIsRegisteredState(true);
      await LocalStorage.setIsRegistered(true);

      try {
        const localUserInfo = await LocalStorage.getUserInfoLocal();
        const localLogs = await LocalStorage.getAllDrinkLogsLocal();

        const cloudInfo = await getUserInfo(userCredential.user.uid);

        if (cloudInfo) {
          const today = format(new Date(), 'yyyy-MM-dd');
          const lastResetDate = cloudInfo.lastResetDate || today;

          let mergedInfo: UserInfo;

          if (localUserInfo && localUserInfo.lastResetDate === today) {
            mergedInfo = {
              ...cloudInfo,
              dailyIntake: localUserInfo.dailyIntake,
              lastResetDate: today,
              userId: userCredential.user.uid,
            };
          } else {
            mergedInfo = {
              ...cloudInfo,
              dailyIntake: lastResetDate !== today ? 0 : cloudInfo.dailyIntake,
              lastResetDate: today,
              userId: userCredential.user.uid,
            };
          }

          await LocalStorage.saveUserInfoLocal(mergedInfo);

          if (localLogs && localLogs.length > 0) {
            try {
              let cloudLogs: DrinkLog[] = [];
              try {
                cloudLogs = await getAllDrinkLogs(userCredential.user.uid);
              } catch (error: any) {
                if (error?.code !== 'permission-denied' && !error?.message?.includes('permissions')) {
                  console.warn('Error loading cloud logs, will upload all local logs:', error);
                }
              }

              const cloudLogIds = new Set(cloudLogs.map(log => log.logId));
              const cloudLogKeys = new Set(
                cloudLogs.map(log => `${log.date}_${log.time}_${log.volume}_${log.drinkType}`)
              );

              let syncedCount = 0;
              for (const log of localLogs) {
                const logKey = `${log.date}_${log.time}_${log.volume}_${log.drinkType}`;
                const existsInCloud = log.logId && !log.logId.startsWith('local_') && cloudLogIds.has(log.logId);
                const duplicateContent = cloudLogKeys.has(logKey);

                if (!existsInCloud && !duplicateContent) {
                  try {
                    const logToUpload: Omit<DrinkLog, 'logId'> = {
                      userId: userCredential.user.uid,
                      date: log.date,
                      time: log.time,
                      volume: log.volume,
                      drinkType: log.drinkType,
                      defaultCupId: log.defaultCupId || 4,
                      createdAt: log.createdAt || Date.now(),
                    };
                    await addDrinkLog(logToUpload);
                    syncedCount++;
                  } catch (uploadError) {
                    console.error('Error uploading individual log:', uploadError);
                  }
                }
              }

              try {
                const updatedCloudLogs = await getAllDrinkLogs(userCredential.user.uid);
                setWaterIntakeHistory(convertDrinkLogsToHistory(updatedCloudLogs));

                await LocalStorage.saveAllDrinkLogsLocal(updatedCloudLogs);

                const today = format(new Date(), 'yyyy-MM-dd');
                const todayLogs = updatedCloudLogs.filter(log => log.date === today);
                const calculatedDailyIntake = todayLogs.reduce((sum, log) => sum + log.volume, 0);
                const updatedMergedInfo = {
                  ...mergedInfo,
                  dailyIntake: calculatedDailyIntake,
                };
                await LocalStorage.saveUserInfoLocal(updatedMergedInfo);
                await updateUserInfo(userCredential.user.uid, {
                  dailyIntake: calculatedDailyIntake,
                  lastResetDate: today,
                });

                setAuthState(prev => ({
                  ...prev,
                  user: updatedMergedInfo,
                  isAuthenticated: true,
                  isNewUser: !updatedMergedInfo.isCompleted,
                }));
              } catch (reloadError) {
                console.error('Error reloading history after sync:', reloadError);
                setWaterIntakeHistory(convertDrinkLogsToHistory(localLogs));
              }
            } catch (syncError) {
              console.error('Error syncing logs to cloud:', syncError);
              setWaterIntakeHistory(convertDrinkLogsToHistory(localLogs));
            }
          } else {
            try {
              const cloudLogs = await getAllDrinkLogs(userCredential.user.uid);
              setWaterIntakeHistory(convertDrinkLogsToHistory(cloudLogs));
              await LocalStorage.saveAllDrinkLogsLocal(cloudLogs);

              const today = format(new Date(), 'yyyy-MM-dd');
              const todayLogs = cloudLogs.filter(log => log.date === today);
              const calculatedDailyIntake = todayLogs.reduce((sum, log) => sum + log.volume, 0);
              const updatedMergedInfo = {
                ...mergedInfo,
                dailyIntake: calculatedDailyIntake,
              };
              await LocalStorage.saveUserInfoLocal(updatedMergedInfo);
              await updateUserInfo(userCredential.user.uid, {
                dailyIntake: calculatedDailyIntake,
                lastResetDate: today,
              });

              setAuthState(prev => ({
                ...prev,
                user: updatedMergedInfo,
                isAuthenticated: true,
                isNewUser: !updatedMergedInfo.isCompleted,
              }));
            } catch (error) {
              console.error('Error loading cloud logs:', error);
              setWaterIntakeHistory([]);
              setAuthState(prev => ({
                ...prev,
                user: mergedInfo,
                isAuthenticated: true,
                isNewUser: !mergedInfo.isCompleted,
              }));
            }
          }

          if (mergedInfo.isCompleted && Platform.OS !== 'web') {
            if (mergedInfo.wakeUpTime) {
              scheduleMorningNotification(mergedInfo).catch(error => {
                console.error('Error scheduling morning notification:', error);
              });
            }
            if (mergedInfo.bedTime) {
              scheduleBedtimeNotification(mergedInfo).catch(error => {
                console.error('Error scheduling bedtime notification:', error);
              });
            }
          }
        } else if (localUserInfo) {
          const updatedLocalInfo = {
            ...localUserInfo,
            userId: userCredential.user.uid,
          };

          const today = format(new Date(), 'yyyy-MM-dd');
          const todayLogs = localLogs.filter(log => log.date === today);
          const calculatedDailyIntake = todayLogs.reduce((sum, log) => sum + log.volume, 0);

          if (updatedLocalInfo.dailyIntake !== calculatedDailyIntake) {
            updatedLocalInfo.dailyIntake = calculatedDailyIntake;
          }

          await LocalStorage.saveUserInfoLocal(updatedLocalInfo);

          setAuthState(prev => ({
            ...prev,
            user: updatedLocalInfo,
            isAuthenticated: true,
            isNewUser: !updatedLocalInfo.isCompleted,
          }));

          setWaterIntakeHistory(convertDrinkLogsToHistory(localLogs));
        }
      } catch (error) {
        console.error('Error loading user data after sign in:', error);
        const localUserInfo = await LocalStorage.getUserInfoLocal();
        const localLogs = await LocalStorage.getAllDrinkLogsLocal();
        if (localUserInfo) {
          const updatedLocalInfo = {
            ...localUserInfo,
            userId: userCredential.user.uid,
          };

          const today = format(new Date(), 'yyyy-MM-dd');
          const todayLogs = localLogs.filter(log => log.date === today);
          const calculatedDailyIntake = todayLogs.reduce((sum, log) => sum + log.volume, 0);

          if (updatedLocalInfo.dailyIntake !== calculatedDailyIntake) {
            updatedLocalInfo.dailyIntake = calculatedDailyIntake;
          }

          await LocalStorage.saveUserInfoLocal(updatedLocalInfo);
          setAuthState(prev => ({
            ...prev,
            user: updatedLocalInfo,
            isAuthenticated: true,
            isNewUser: !updatedLocalInfo.isCompleted,
          }));

          setWaterIntakeHistory(convertDrinkLogsToHistory(localLogs));
        }
      }
    } catch (error: any) {
      console.warn('Sign in failed:', error?.code || error?.message || 'Invalid credentials');
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string): Promise<void> => {
    try {
      const response = await createUserWithEmailAndPassword(auth, email, password);

      const localUserInfo = await LocalStorage.getUserInfoLocal();
      const localLogs = await LocalStorage.getAllDrinkLogsLocal();
      const today = format(new Date(), 'yyyy-MM-dd');

      const initialUserInfo: UserInfo = {
        userId: response.user.uid,
        name: name || localUserInfo?.name || '',
        dailyIntake: localUserInfo?.lastResetDate === today ? (localUserInfo.dailyIntake || 0) : 0,
        lastResetDate: today,
        isCompleted: localUserInfo?.isCompleted || false,
        weight: localUserInfo?.weight || 0,
        height: localUserInfo?.height || 0,
        age: localUserInfo?.age || 0,
        gender: localUserInfo?.gender || 'Other',
        activity: localUserInfo?.activity || 'sendatry',
        climate: localUserInfo?.climate || 'temperate',
        wakeUpTime: localUserInfo?.wakeUpTime || '07:00',
        bedTime: localUserInfo?.bedTime || '23:00',
        dailyGoal: localUserInfo?.dailyGoal || 0,
        cupSize: localUserInfo?.cupSize || 200,
      };

      try {
        await saveUserInfo(initialUserInfo);
      } catch (firestoreError) {
        console.error('Error saving user info to Firestore:', firestoreError);
      }

      await LocalStorage.saveUserInfoLocal(initialUserInfo);
      if (localLogs && localLogs.length > 0) {
        try {
          let syncedCount = 0;
          for (const log of localLogs) {
            try {
              const logToUpload: Omit<DrinkLog, 'logId'> = {
                userId: response.user.uid,
                date: log.date,
                time: log.time,
                volume: log.volume,
                drinkType: log.drinkType,
                defaultCupId: log.defaultCupId || 4,
                createdAt: log.createdAt || Date.now(),
              };
              await addDrinkLog(logToUpload);
              syncedCount++;
            } catch (uploadError) {
              console.error('Error uploading log during signup:', uploadError);
            }
          }

          try {
            const cloudLogs = await getAllDrinkLogs(response.user.uid);
            setWaterIntakeHistory(convertDrinkLogsToHistory(cloudLogs));
            await LocalStorage.saveAllDrinkLogsLocal(cloudLogs);

            const today = format(new Date(), 'yyyy-MM-dd');
            const todayLogs = cloudLogs.filter(log => log.date === today);
            const calculatedDailyIntake = todayLogs.reduce((sum, log) => sum + log.volume, 0);
            const updatedUserInfo = {
              ...initialUserInfo,
              dailyIntake: calculatedDailyIntake,
            };
            await LocalStorage.saveUserInfoLocal(updatedUserInfo);
            await updateUserInfo(response.user.uid, {
              dailyIntake: calculatedDailyIntake,
              lastResetDate: today,
            });

            setAuthState(prev => ({
              ...prev,
              user: updatedUserInfo,
              isAuthenticated: true,
              isNewUser: !updatedUserInfo.isCompleted,
            }));
          } catch (reloadError) {
            console.error('Error reloading history after signup sync:', reloadError);
            setWaterIntakeHistory(convertDrinkLogsToHistory(localLogs));
          }
        } catch (syncError) {
          console.error('Error syncing logs during signup:', syncError);
          setWaterIntakeHistory(convertDrinkLogsToHistory(localLogs));
        }
      } else {
        setWaterIntakeHistory([]);
      }
    } catch (error: any) {
      console.error('Firebase Auth sign up error:', error);
      throw error;
    }
  };

  const syncToCloud = async (): Promise<void> => {
    const firebaseUser = auth.currentUser;
    if (!isRegistered || !firebaseUser || !authState.user) {
      throw new Error('User not registered or not authenticated');
    }

    try {
      await saveUserInfo(authState.user);

      const localLogs = await LocalStorage.getAllDrinkLogsLocal();
      let cloudLogs: DrinkLog[] = [];
      try {
        cloudLogs = await getAllDrinkLogs(authState.user.userId);
      } catch (error: any) {
        if (error?.code === 'permission-denied' || error?.message?.includes('permissions')) {
          console.warn('Firestore permissions denied during sync, will upload all local logs');
        } else {
          throw error;
        }
      }
      const cloudLogIds = new Set(cloudLogs.map(log => log.logId));

      for (const log of localLogs) {
        if (!log.logId.startsWith('local_') && !cloudLogIds.has(log.logId)) {
          const logToUpload: Omit<DrinkLog, 'logId'> = {
            userId: authState.user.userId,
            date: log.date,
            time: log.time,
            volume: log.volume,
            drinkType: log.drinkType,
            defaultCupId: log.defaultCupId,
            createdAt: log.createdAt,
          };
          await addDrinkLog(logToUpload);
        }
      }

      await LocalStorage.clearPendingSync();
    } catch (error) {
      console.error('Error syncing to cloud:', error);
      await LocalStorage.markPendingSync();
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);

      await LocalStorage.clearAllLocalData();
      setIsRegisteredState(false);
      const localUserId = await LocalStorage.getLocalUserId();
      const today = format(new Date(), 'yyyy-MM-dd');
      const newUserInfo: UserInfo = {
        userId: localUserId,
        name: '',
        weight: 0,
        height: 0,
        age: 0,
        gender: 'Other',
        activity: 'sendatry',
        climate: 'temperate',
        wakeUpTime: '07:00',
        bedTime: '23:00',
        dailyGoal: 0,
        dailyIntake: 0,
        lastResetDate: today,
        isCompleted: false,
        cupSize: 200,
      };
      await LocalStorage.saveUserInfoLocal(newUserInfo);

      setAuthState({
        user: newUserInfo,
        isAuthenticated: true,
        isLoading: false,
        isNewUser: true,
      });
    } catch (error) {
      console.error('Error during logout:', error);
      try {
        await LocalStorage.clearAllLocalData();
        setIsRegisteredState(false);

        const localUserId = await LocalStorage.getLocalUserId();
        const today = format(new Date(), 'yyyy-MM-dd');
        const newUserInfo: UserInfo = {
          userId: localUserId,
          name: '',
          weight: 0,
          height: 0,
          age: 0,
          gender: 'Other',
          activity: 'sendatry',
          climate: 'temperate',
          wakeUpTime: '07:00',
          bedTime: '23:00',
          dailyGoal: 0,
          dailyIntake: 0,
          lastResetDate: today,
          isCompleted: false,
          cupSize: 200,
        };
        await LocalStorage.saveUserInfoLocal(newUserInfo);

        setAuthState({
          user: newUserInfo,
          isAuthenticated: true,
          isLoading: false,
          isNewUser: true,
        });
      } catch (resetError) {
        console.error('Error resetting state:', resetError);
        setAuthState(initialState);
      }
    }
  };

  const handleOnboardingComplete = async (onboardingData: Omit<UserInfo, 'userId' | 'dailyIntake' | 'isCompleted'>): Promise<void> => {
    if (!authState.user?.userId) throw new Error('User not found.');

    let finalGoal = 2000;

    try {
      finalGoal = calculateWaterIntake({
        weight: onboardingData.weight, height: onboardingData.height, age: onboardingData.age,
        gender: onboardingData.gender as any, activityLevel: onboardingData.activity as any,
        wakeUpTime: onboardingData.wakeUpTime, sleepTime: onboardingData.bedTime,
        weather: onboardingData.climate as any,
      });
    } catch (e) {
      console.error("Error calculating daily goal, falling back to 2000ml:", e);
    }

    const today = format(new Date(), 'yyyy-MM-dd');
    const newUserInfo: UserInfo = {
      ...onboardingData,
      userId: authState.user.userId,
      dailyIntake: 0,
      lastResetDate: today,
      isCompleted: true,
      dailyGoal: finalGoal,
      cupSize: onboardingData.cupSize || 200,
    };

    await LocalStorage.saveUserInfoLocal(newUserInfo);
    // Đảm bảo lưu flag đã xem onboarding khi hoàn thành userInfo
    await LocalStorage.setHasSeenOnboarding(true);
    
    if (isRegistered && auth.currentUser) {
      try {
        await saveUserInfo(newUserInfo);
      } catch (error) {
        console.error('Error saving to Firestore, data saved locally:', error);
        await LocalStorage.markPendingSync();
      }
    }

    setAuthState(prev => ({
      ...prev,
      user: newUserInfo,
      isNewUser: false,
      isAuthenticated: true
    }));

    if (Platform.OS !== 'web') {
      if (newUserInfo.wakeUpTime) {
        scheduleMorningNotification(newUserInfo).catch(error => {
          console.error('Error scheduling morning notification:', error);
        });
      }
      if (newUserInfo.bedTime) {
        scheduleBedtimeNotification(newUserInfo).catch(error => {
          console.error('Error scheduling bedtime notification:', error);
        });
      }
    }
  };

  const addWaterLog = async (volume: number, drinkType: string, defaultCupId?: number): Promise<void> => {
    if (!authState.user || !authState.user.userId) return;

    const today = format(new Date(), 'yyyy-MM-dd');
    const lastResetDate = authState.user.lastResetDate || today;

    let currentIntake = authState.user.dailyIntake || 0;
    if (lastResetDate !== today) {
      currentIntake = 0;
    }

    const newLog: Omit<DrinkLog, 'logId'> = {
      userId: authState.user.userId,
      date: today,
      time: format(new Date(), 'HH:mm:ss'),
      volume: volume,
      drinkType: drinkType,
      defaultCupId: defaultCupId,
      createdAt: Date.now()
    };

    const newIntake = currentIntake + volume;
    const addedLog = await LocalStorage.saveDrinkLogLocal(newLog);
    const historyItem: IntakeHistoryType = {
      id: addedLog.logId,
      date: today,
      time: format(new Date(), 'HH:mm:ss'),
      amount: volume.toString(),
      drinkType: drinkType,
      defaultCupId: defaultCupId || 4,
    };

    const updatedUserInfo: UserInfo = {
      ...authState.user,
      dailyIntake: newIntake,
      lastResetDate: today,
    };
    await LocalStorage.saveUserInfoLocal(updatedUserInfo);

    setWaterIntakeHistory(prev => {
      const newHistory = [historyItem, ...prev];
      return newHistory.sort((a, b) => {
        const timeA = a.time || '00:00:00';
        const timeB = b.time || '00:00:00';
        const timePartsA = timeA.split(':').map(Number);
        const timePartsB = timeB.split(':').map(Number);

        for (let i = 0; i < 3; i++) {
          if (timePartsB[i] !== timePartsA[i]) {
            return timePartsB[i] - timePartsA[i]; // Descending order
          }
        }
        return 0;
      });
    });
    setAuthState(prev => ({
      ...prev,
      user: updatedUserInfo,
    }));

    if (isRegistered && auth.currentUser) {
      try {
        await addDrinkLog(newLog);
        await updateUserInfo(authState.user.userId, {
          dailyIntake: newIntake,
          lastResetDate: today,
        });
      } catch (error) {
        console.error('Error saving to Firestore, data saved locally:', error);
        await LocalStorage.markPendingSync();
      }
    }

    const dailyGoal = authState.user.dailyGoal || 2000;
    if (Platform.OS !== 'web') {
      sendGoalAchievedNotification(dailyGoal, newIntake).catch(error => {
        console.error('Error sending goal achieved notification:', error);
      });
    }
  };

  const updateUserDailyIntake = async (intake: number): Promise<void> => {
    if (!authState.user || !authState.user.userId) return;
    await updateUserInfo(authState.user.userId, { dailyIntake: intake });
    setAuthState(prev => ({
      ...prev,
      user: { ...prev.user, dailyIntake: intake } as UserInfo,
    }));
  };

  const handleHistoryDelete = async (id: string): Promise<void> => {
    if (!authState.user?.userId) return;

    const logToDelete = waterIntakeHistory.find(log => log.id === id);
    if (!logToDelete) return;

    await LocalStorage.deleteDrinkLogLocal(id);

    setWaterIntakeHistory(prev => prev.filter(log => log.id !== id));
    if (logToDelete && authState.user) {
      const today = format(new Date(), 'yyyy-MM-dd');
      const dailyGoal = authState.user.dailyGoal || 2000;
      const previousIntake = authState.user.dailyIntake || 0;
      const wasGoalAchieved = previousIntake >= dailyGoal * 0.95;
      
      if (logToDelete.date === today) {
        const volumeToSubtract = parseInt(logToDelete.amount) || 0;
        const newIntake = Math.max(0, previousIntake - volumeToSubtract);
        const updatedUserInfo: UserInfo = {
          ...authState.user,
          dailyIntake: newIntake,
        };
        await LocalStorage.saveUserInfoLocal(updatedUserInfo);
        setAuthState(prev => ({
          ...prev,
          user: updatedUserInfo,
        }));

        if (isRegistered && auth.currentUser) {
          try {
            await deleteDrinkLog(id);
            await updateUserInfo(authState.user.userId, { dailyIntake: newIntake });
          } catch (error) {
            console.error('Error deleting from Firestore, deleted locally:', error);
            await LocalStorage.markPendingSync();
          }
        }

        if (wasGoalAchieved && newIntake < dailyGoal * 0.95 && updatedUserInfo.isCompleted) {
          if (Platform.OS !== 'web' && updatedUserInfo.wakeUpTime && updatedUserInfo.bedTime) {
            try {
              await clearGoalAchievedFlag();
              await startReminder('2hours', updatedUserInfo);
              await scheduleMorningNotification(updatedUserInfo);
              await scheduleBedtimeNotification(updatedUserInfo);
            } catch (error) {
              console.error('Error rescheduling notifications after goal drop:', error);
            }
          }
        }
      } else {
        if (isRegistered && auth.currentUser) {
          try {
            await deleteDrinkLog(id);
          } catch (error) {
            console.error('Error deleting from Firestore, deleted locally:', error);
            await LocalStorage.markPendingSync();
          }
        }
      }
    }
  };

  const updateUserInfoField = async (value: any, field: string): Promise<void> => {
    try {
      let updatedUser: UserInfo | null = null;
      let userId: string = '';

      setAuthState(prev => {
        if (!prev.user || !prev.user.userId) {
          console.error('[ERROR] No user or userId found');
          return prev;
        }
        userId = prev.user.userId;
        updatedUser = { ...prev.user, [field]: value } as UserInfo;
        return {
          ...prev,
          user: updatedUser,
        };
      });

      if (!updatedUser || !userId) {
        console.error('[ERROR] No user or userId found after state update');
        return;
      }

      const finalUser = updatedUser as UserInfo;

      await LocalStorage.saveUserInfoLocal(finalUser);

      if (isRegistered && auth.currentUser) {
        try {
          await updateUserInfo(userId, { [field]: value });
        } catch (error) {
          console.error('Error updating Firestore, updated locally:', error);
          await LocalStorage.markPendingSync();
        }
      }

      if (Platform.OS !== 'web' && finalUser.isCompleted) {
        if (field === 'wakeUpTime' && finalUser.wakeUpTime) {
          scheduleMorningNotification(finalUser).catch(error => {
            console.error('[ERROR] Error rescheduling morning notification:', error);
          });
        }
        if (field === 'bedTime' && finalUser.bedTime) {
          scheduleBedtimeNotification(finalUser).catch(error => {
            console.error('[ERROR] Error rescheduling bedtime notification:', error);
          });
        }
      }
    } catch (error) {
      console.error('[ERROR] Error in updateUserInfoField:', error);
      throw error;
    }
  };

  const updateMultipleUserInfoFields = async (updates: Record<string, any>): Promise<void> => {
    try {
      if (!authState.user || !authState.user.userId) {
        console.error('[ERROR] No user or userId found');
        return;
      }

      let updatedUser: UserInfo;
      let userId: string;

      setAuthState(prev => {
        if (!prev.user || !prev.user.userId) {
          console.error('[ERROR] No user or userId found in state');
          return prev;
        }
        userId = prev.user.userId;
        updatedUser = { ...prev.user, ...updates } as UserInfo;
        return {
          ...prev,
          user: updatedUser,
        };
      });

      if (!updatedUser! || !userId!) {
        console.error('[ERROR] Failed to get user after state update');
        return;
      }

      await LocalStorage.saveUserInfoLocal(updatedUser);
      if (isRegistered && auth.currentUser) {
        try {
          await updateUserInfo(userId, updates);
        } catch (error) {
          console.error('Error updating Firestore, updated locally:', error);
          await LocalStorage.markPendingSync();
        }
      }

      if (Platform.OS !== 'web' && updatedUser.isCompleted) {
        if (updates.wakeUpTime && updatedUser.wakeUpTime) {
          scheduleMorningNotification(updatedUser).catch(error => {
            console.error('[ERROR] Error rescheduling morning notification:', error);
          });
        }
        if (updates.bedTime && updatedUser.bedTime) {
          scheduleBedtimeNotification(updatedUser).catch(error => {
            console.error('[ERROR] Error rescheduling bedtime notification:', error);
          });
        }
      }
    } catch (error) {
      console.error('[ERROR] Error in updateMultipleUserInfoFields:', error);
      throw error;
    }
  };

  const verifyCurrentPassword = async (password: string): Promise<boolean> => {
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) {
      throw new Error('Không tìm thấy người dùng đăng nhập');
    }

    if (!password || password.length === 0) {
      return false;
    }

    try {
      const credential = EmailAuthProvider.credential(currentUser.email, password);
      await reauthenticateWithCredential(currentUser, credential);
      return true;
    } catch (error: any) {
      if (
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/invalid-credential' ||
        error.code === 'auth/user-mismatch' ||
        error.code === 'auth/user-not-found'
      ) {
        return false;
      }

      if (error.code === 'auth/network-request-failed') {
        console.warn('Network error while verifying password - user can retry');
        return false;
      }

      if (__DEV__) {
        console.warn('Error verifying password:', error.code || error.message);
      }

      return false;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) {
      throw new Error('Không tìm thấy người dùng đăng nhập');
    }

    try {
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);

      await updatePassword(currentUser, newPassword);
    } catch (error: any) {
      console.error('Error changing password:', error);
      let errorMessage = 'Không thể đổi mật khẩu';

      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Mật khẩu hiện tại không đúng';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Mật khẩu mới quá yếu. Vui lòng chọn mật khẩu mạnh hơn';
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Vui lòng đăng nhập lại để đổi mật khẩu';
      }

      throw new Error(errorMessage);
    }
  };

  const deleteAccount = async (password: string): Promise<void> => {
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email || !authState.user?.userId) {
      throw new Error('Không tìm thấy người dùng đăng nhập');
    }

    try {
      const credential = EmailAuthProvider.credential(currentUser.email, password);
      await reauthenticateWithCredential(currentUser, credential);

      await deleteUserAccount(authState.user.userId);

      await deleteUser(currentUser);
    } catch (error: any) {
      console.error('Error deleting account:', error);
      let errorMessage = 'Không thể xóa tài khoản';

      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = 'Mật khẩu không đúng';
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Vui lòng đăng nhập lại để xóa tài khoản';
      }

      throw new Error(errorMessage);
    }
  };

  return (
    <UserAuthContext.Provider value={{
      ...authState,
      signIn,
      signUp,
      signOut: logout,
      handleOnboardingComplete,
      addWaterLog,
      updateUserDailyIntake,
      userWaterIntakeHistory: waterIntakeHistory,
      handleHistoryDelete,
      updateUserInfo: updateUserInfoField,
      updateMultipleUserInfo: updateMultipleUserInfoFields,
      changePassword,
      verifyCurrentPassword,
      deleteAccount,
      isRegistered,
      syncToCloud,
    }}>
      {children}
    </UserAuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(UserAuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a UserAuthContextProvider');
  }
  return context;
};