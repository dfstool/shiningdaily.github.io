import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { actions } from '@/store/app';
import type { StateType, DispatchType } from '@/store';
import type { FansFollowersType } from '@/store/app';

export const useShowDrawer = () => {
  const dispatch = useDispatch<DispatchType>();
  const followers = useSelector<StateType, FansFollowersType>((state: StateType) => state.app.followers);

  const handleShowDrawer = useCallback((account: string) => {
    let status = null;
    for (let i=0; i<followers.length; i++) {
      if (account === followers[i].owner) {
        status = 'followed';
        break;
      }
    }
    dispatch(actions.setDrawerType({type: 'account', value: account, status}));
    dispatch(actions.setIframeSrc(`https://dfs-shining.netlify.app/homepage/${account}`))
    dispatch(actions.setIsDrawerOpen(true));
  }, [dispatch, followers]);

  return handleShowDrawer;
}

export const useShowDrawer2 = () => {
  const dispatch = useDispatch<DispatchType>();
  const likePostIds = useSelector<StateType, number[]>((state: StateType) => state.app.likePostIds);

  const handleShowDrawer = useCallback((addr: string, postId: number) => {
    let status = '';
    if (likePostIds.includes(postId)) {
      status = 'liked';
    }
    dispatch(actions.setDrawerType({type: 'postId', value: postId, status}));
    dispatch(actions.setIframeSrc(addr))
    dispatch(actions.setIsDrawerOpen(true));
  }, [dispatch, likePostIds]);

  return handleShowDrawer;
}