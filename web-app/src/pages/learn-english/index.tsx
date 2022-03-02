import { List } from 'antd-mobile';
import React, { FC, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ContextData } from '../../store/ContextApp';
import { getHandle } from '../../utils/fetch';
import { useLoadingCb } from '../../utils/hooks';

const { Item: ListItem } = List;

type TypeList = {
  _id: string;
  name: string;
  type: string;
};

const LearnEnglish: FC = () => {
  const { navBar, dispatch } = useContext(ContextData);
  const navigate = useNavigate();
  const loadingCb = useLoadingCb();

  const [list, setList] = useState<TypeList[]>([]);

  const getTypeList = async () => {
    const { data, err } = await getHandle<TypeList[]>('word_type_list', {}, loadingCb);
    if (err) {
      return;
    }
    setList(data);
  };

  useEffect(() => {
    dispatch({
      type: 'navBar',
      payload: { ...navBar, title: '单词库', backArrow: true },
    });
    getTypeList();
  }, []);
  return (
    <List mode="card" header="单词库">
      {list.map(({ _id, name, type }) => (
        <ListItem
          key={_id}
          onClick={() => {
            navigate(`/word/${type}/${_id}`);
          }}>
          {name}
        </ListItem>
      ))}
    </List>
  );
};

export default LearnEnglish;
